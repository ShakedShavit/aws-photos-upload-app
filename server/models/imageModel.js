const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    originalName: {
        type: String
    },
    storageName: {
        type: String
    },
    bucket: {
        type: String
    },
    region: {
        type: String
    },
    key: {
        type: String
    }
});

const Image = mongoose.model('Image', imageSchema);

module.exports = { Image };