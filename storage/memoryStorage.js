// In-memory storage for testing (fallback when MongoDB is not available)
const fileStorage = new Map();

function saveFile(fileData) {
    const uuid = fileData.uuid;
    fileStorage.set(uuid, {
        ...fileData,
        createdAt: new Date()
    });
    return fileData;
}

function findFileByUuid(uuid) {
    return fileStorage.get(uuid) || null;
}

function getAllFiles() {
    return Array.from(fileStorage.values());
}

function deleteFile(uuid) {
    return fileStorage.delete(uuid);
}

// Clean up files older than 24 hours (optional, for memory management)
function cleanupOldFiles() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (const [uuid, file] of fileStorage.entries()) {
        if (now - file.createdAt.getTime() > oneDay) {
            fileStorage.delete(uuid);
        }
    }
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

module.exports = {
    saveFile,
    findFileByUuid,
    getAllFiles,
    deleteFile
};

