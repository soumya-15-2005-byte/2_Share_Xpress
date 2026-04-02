const router = require('express').Router();
const File = require('../models/file');
const mongoose = require('mongoose');
const memoryStorage = require('../storage/memoryStorage');

router.get('/:uuid', async (req, res) => {
   try {
     const uuid = req.params.uuid;
     console.log(`📥 Download request for UUID: ${uuid}`);
     
     let file = null;
     
     // Try MongoDB first if connected
     if (mongoose.connection.readyState === 1) {
         try {
             file = await File.findOne({ uuid: uuid });
             if (file) {
                 console.log(`✅ File metadata found in MongoDB: ${file.filename}`);
             }
         } catch (err) {
             console.error('Error fetching from MongoDB:', err.message);
         }
     }
     
     // Fallback to memory storage
     if (!file) {
         file = memoryStorage.findFileByUuid(uuid);
         if (file) {
             console.log(`✅ File metadata found in memory: ${file.filename}`);
         }
     }
     
     // Link expired
     if(!file) {
          console.log(`❌ File metadata not found for UUID: ${uuid}`);
          return res.render('download', { error: 'Link has expired or file not found.'});
     } 
     
     const fs = require('fs');
     
     // Try downloading from GridFS first if MongoDB is connected
     if (mongoose.connection.readyState === 1) {
         try {
             console.log(`🔍 Attempting GridFS download for: ${file.filename}`);
             const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
             
             const downloadStream = bucket.openDownloadStreamByName(file.filename);
             
             // Wait for stream to be ready before returning to ensure we can catch ENOENT
             let streamValid = false;
             
             downloadStream.on('error', (err) => {
                 // Ignore error if it happens after stream already piping locally somehow
                 if (!streamValid) {
                     console.error('GridFS streaming error:', err);
                     // If it fails, we fall through to local disk check below by doing nothing else here
                 }
             });
             
             // We can't effectively 'await' the stream validity in a robust way without wrapping it or piping 
             // immediately, so we pipe and handle errors inline. 
             res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
             res.set('Content-Type', 'application/octet-stream');
             
             downloadStream.on('data', () => { streamValid = true; });
             
             // We MUST return here to prevent Express from continuing execution if stream succeeds
             return downloadStream.pipe(res).on('error', (err) => {
                  if (!res.headersSent) {
                      res.removeHeader('Content-Disposition');
                      res.removeHeader('Content-Type');
                  }
                  // Proceed to disk fallback if GridFS file doesn't exist
                  tryLocalFallback(res, file, __dirname);
             });
         } catch (e) {
             console.error('Error initiating GridFS download:', e);
         }
     } else {
         tryLocalFallback(res, file, __dirname);
     }
     
     // Helper function for local fallback
     function tryLocalFallback(res, file, dirname) {
         let fallbackPath = file.path;
         if (!fallbackPath.includes('uploads') && !fallbackPath.includes('tmp')) {
             fallbackPath = `uploads/${fallbackPath}`; 
         }
         
         const filePath = `${dirname}/../${fallbackPath}`;
         console.log(`🔍 Checking file at path: ${filePath}`);
         
         if (fs.existsSync(filePath)) {
           console.log(`✅ File found on disk, starting download: ${file.filename}`);
           return res.download(filePath, file.filename);
         } else if (fallbackPath.startsWith('/tmp') && fs.existsSync(fallbackPath)) {
           console.log(`✅ File found in /tmp, starting download: ${file.filename}`);
           return res.download(fallbackPath, file.filename);
         }
         
         console.error(`❌ File not found anywhere: ${file.filename}`);
         return res.status(404).render('download', { 
           error: 'File not found on server. It may have been deleted.' 
         });
     }
   } catch (error) {
     console.error('Error downloading file:', error);
     return res.status(500).render('download', { error: 'Something went wrong while downloading the file.'});
   }
});


module.exports = router;