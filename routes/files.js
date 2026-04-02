const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const memoryStorage = require('../storage/memoryStorage');

const fs = require('fs');

// Ensure uploads folder exists locally but skip on Vercel if read-only
const uploadDir = 'uploads/';
try {
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (e) {
    console.log("Skipping upload folder creation, likely on Vercel read-only filesystem");
}

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Vercel only allows writing to /tmp
        if (process.env.VERCEL) {
            cb(null, '/tmp');
        } else {
            cb(null, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});

let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('myfile'); //100mb

router.post('/', (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).send({ error: err.message });
      }
      
      if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
      }
      
      const uuid = uuidv4();
      const fileData = {
        filename: req.file.filename,
        uuid: uuid,
        path: req.file.path,
        size: req.file.size
      };
      
      // Always use the actual request host to prevent broken links from misconfigured env vars
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      console.log(`🌐 Dynamically generated base URL: ${baseUrl}`);
      
      // Try to save to MongoDB if connected, otherwise use memory storage
      if (mongoose.connection.readyState === 1) {
        try {
          const file = new File(fileData);
          const response = await file.save();
          return res.json({ file: `${baseUrl}/files/${response.uuid}` });
        } catch (error) {
          console.error('Error saving to MongoDB, using memory storage:', error.message);
          // Fall through to memory storage
        }
      } else {
        console.log('📦 MongoDB not connected, using in-memory storage for testing');
      }
      
      // Use in-memory storage as fallback
      try {
        memoryStorage.saveFile(fileData);
        console.log(`✅ File saved to memory storage: ${uuid}`);
        return res.json({ file: `${baseUrl}/files/${uuid}` });
      } catch (error) {
        console.error('Error saving file to memory storage:', error);
        return res.status(500).send({ 
          error: 'Failed to save file information. ' + error.message 
        });
      }
    });
});

router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if(!uuid || !emailTo || !emailFrom) {
      return res.status(422).send({ error: 'All fields are required except expiry.'});
  }
  // Get data from db 
  try {
    const file = await File.findOne({ uuid: uuid });
    if(file.sender) {
      return res.status(422).send({ error: 'Email already sent once.'});
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require('../services/mailService');
    
    // Always use the actual request host to prevent broken email links
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host') || 'localhost:3000';
    const emailBaseUrl = `${protocol}://${host}`;
    
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'inShare file sharing',
      text: `${emailFrom} shared a file with you.`,
      html: require('../services/emailTemplate')({
                emailFrom : emailFrom, 
                downloadLink: `${emailBaseUrl}/files/${file.uuid}?source=email` ,
                size: parseInt(file.size/1000) + ' KB',
                expires: '24 hours'
            })
    }).then(() => {
      return res.json({success: true});
    }).catch(err => {
      return res.status(500).json({error: 'Error in email sending.'});
    });
} catch(err) {
  return res.status(500).send({ error: 'Something went wrong.'});
}

});

module.exports = router;