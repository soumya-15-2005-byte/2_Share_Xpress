require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env file');
        return;
    }

    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    }).catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('💡 Please check your MONGO_URI in .env file');
        console.log('💡 Make sure your MongoDB Atlas cluster exists and is accessible');
        console.log('💡 Server will still start, but file operations will not work without database');
    });

    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log('✅ Database connected 🥳🥳🥳🥳');
    });

    connection.on('error', (err) => {
        console.error('❌ Connection failed ☹️', err.message);
        if (err.message.includes('ENOTFOUND')) {
            console.log('💡 This usually means the MongoDB cluster URL is incorrect or the cluster doesn\'t exist');
            console.log('💡 Please check your MongoDB Atlas connection string');
        }
    });

    connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
    });
}

module.exports = connectDB;
