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
     
     const filePath = `${__dirname}/../${file.path}`;
     const fs = require('fs');
     
     console.log(`🔍 Checking file at path: ${filePath}`);
     
     if (!fs.existsSync(filePath)) {
       console.error(`❌ File not found on disk: ${filePath}`);
       console.error(`⚠️ This is common on free hosting - files are deleted when server restarts.`);
       return res.status(404).render('download', { 
         error: 'File not found on server. On free hosting platforms like Render, uploaded files are deleted when the server restarts or sleeps. Consider using MongoDB GridFS or cloud storage for persistent file storage.' 
       });
     }
     
     console.log(`✅ File found, starting download: ${file.filename}`);
     res.download(filePath, file.filename);
   } catch (error) {
     console.error('Error downloading file:', error);
     return res.status(500).render('download', { error: 'Something went wrong while downloading the file.'});
   }
});


module.exports = router;