const router = require('express').Router();
const File = require('../models/file');
const mongoose = require('mongoose');
const memoryStorage = require('../storage/memoryStorage');

router.get('/:uuid', async (req, res) => {
    try {
        const uuid = req.params.uuid;
        console.log(`🔍 Looking for file with UUID: ${uuid}`);
        
        let file = null;
        
        // Try MongoDB first if connected
        if (mongoose.connection.readyState === 1) {
            try {
                file = await File.findOne({ uuid: uuid });
                if (file) {
                    console.log(`✅ File found in MongoDB: ${file.filename}`);
                } else {
                    console.log(`❌ File not found in MongoDB for UUID: ${uuid}`);
                }
            } catch (err) {
                console.error('Error fetching from MongoDB:', err.message);
            }
        } else {
            console.log('⚠️ MongoDB not connected, checking memory storage...');
        }
        
        // Fallback to memory storage
        if (!file) {
            file = memoryStorage.findFileByUuid(uuid);
            if (file) {
                console.log(`✅ File found in memory storage: ${file.filename}`);
            } else {
                console.log(`❌ File not found in memory storage for UUID: ${uuid}`);
            }
        }
        
        // Link expired or file not found
        if(!file) {
            console.log(`❌ File not found for UUID: ${uuid}`);
            return res.render('download', { error: 'Link has expired or file not found. Files on free hosting may be deleted after server restart.'});
        } 
        
        // Auto-detect base URL from request if not set in env
        let baseUrl = process.env.APP_BASE_URL;
        if (!baseUrl) {
          const protocol = req.protocol || 'http';
          const host = req.get('host') || 'localhost:3000';
          baseUrl = `${protocol}://${host}`;
        }
        return res.render('download', { 
            uuid: file.uuid, 
            fileName: file.filename, 
            fileSize: file.size, 
            downloadLink: `${baseUrl}/files/download/${file.uuid}` 
        });
    } catch(err) {
        console.error('Error in show route:', err);
        return res.render('download', { error: 'Something went wrong. Please try again.'});
    }
});


module.exports = router;