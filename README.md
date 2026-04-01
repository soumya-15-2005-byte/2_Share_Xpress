# ShareXpress 🚀

A modern, secure file sharing application built with Node.js and Express. Upload files and get instant shareable links!

![ShareXpress](https://img.shields.io/badge/ShareXpress-File%20Sharing-blue)
![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![Express](https://img.shields.io/badge/Express-v4.17+-lightgrey)

## ✨ Features

- 📤 **Easy File Upload** - Drag and drop or click to upload files
- 🔗 **Instant Shareable Links** - Get unique links immediately after upload
- 🔒 **Secure** - Files are stored securely with unique UUIDs
- ⚡ **Fast** - Lightning-fast uploads and downloads
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 💾 **Dual Storage** - Works with MongoDB or in-memory storage for testing
- ⏰ **Auto Expiry** - Links expire after 24 hours
- 📧 **Email Sharing** - Share files via email (optional)

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional - works without it for testing)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Share_Xpress
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
APP_BASE_URL=http://localhost:3000
```

4. **Create uploads directory**
```bash
mkdir uploads
```

5. **Start the server**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
Share_Xpress/
├── config/
│   └── db.js              # Database configuration
├── models/
│   └── file.js            # File model schema
├── routes/
│   ├── files.js           # File upload routes
│   ├── show.js            # File display route
│   └── download.js        # File download route
├── services/
│   ├── mailService.js     # Email service
│   └── emailTemplate.js   # Email templates
├── storage/
│   └── memoryStorage.js   # In-memory storage (for testing)
├── views/
│   └── download.ejs       # Download page template
├── public/
│   ├── css/
│   │   └── style.css      # Styles
│   ├── img/               # Images
│   └── index.html         # Upload page
├── uploads/               # Uploaded files storage
├── server.js              # Main server file
└── package.json           # Dependencies
```

## 🎯 API Endpoints

### Upload File
```http
POST /api/files
Content-Type: multipart/form-data

Body:
  myfile: <file>
```

**Response:**
```json
{
  "file": "http://localhost:3000/files/{uuid}"
}
```

### View File Info
```http
GET /files/{uuid}
```

### Download File
```http
GET /files/download/{uuid}
```

### Send File via Email
```http
POST /api/files/send
Content-Type: application/json

Body:
{
  "uuid": "file-uuid",
  "emailTo": "recipient@example.com",
  "emailFrom": "sender@example.com",
  "expiresIn": "24" // optional
}
```

## 🧪 Testing

### Manual Testing

1. **Upload Test**
   - Go to `http://localhost:3000`
   - Select a file
   - Click upload
   - Copy the download link

2. **Download Test**
   - Open the download link
   - Click download button
   - Verify file downloads correctly

### Automated Testing

Run the test script:
```bash
chmod +x test-upload.sh
./test-upload.sh
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGO_URI` | MongoDB connection string | - |
| `APP_BASE_URL` | Base URL for links | `http://localhost:3000` |

### Storage Options

**MongoDB (Production)**
- Set `MONGO_URI` in `.env`
- Files metadata stored in MongoDB
- Persistent across server restarts

**In-Memory (Testing)**
- Works without MongoDB
- Files metadata stored in memory
- Cleared on server restart

## 📝 Features in Detail

### File Upload
- Supports all file types
- Maximum file size: 100MB
- Unique filename generation
- Progress indication

### Security
- Unique UUID for each file
- Files stored securely on server
- No direct file access without UUID

### Link Expiry
- Links expire after 24 hours
- Automatic cleanup of old files

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **File Upload**: Multer
- **Templating**: EJS
- **Styling**: CSS3
- **Email**: Nodemailer

## 📦 Dependencies

```json
{
  "express": "^4.17.1",
  "mongoose": "^5.10.0",
  "multer": "^1.4.2",
  "ejs": "^3.1.5",
  "nodemailer": "^6.4.11",
  "uuid": "^8.3.0",
  "dotenv": "^8.2.0",
  "cors": "^2.8.5"
}
```

## 🐛 Troubleshooting

### Upload keeps loading
- Check MongoDB connection (if using)
- Check `uploads/` folder exists and is writable
- Check server console for errors

### File not found error
- Verify file exists in `uploads/` folder
- Check file path in database/memory storage
- Ensure UUID is correct

### MongoDB connection issues
- Verify `MONGO_URI` in `.env`
- Check MongoDB server is running
- Verify network connectivity
- App will use in-memory storage as fallback

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for easy file sharing

## 🙏 Acknowledgments

- Express.js community
- MongoDB for database support
- All contributors and users

---

**Made with ❤️ using Node.js and Express**
