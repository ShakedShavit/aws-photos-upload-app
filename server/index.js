const express = require('express');
const cors = require('cors');
const fs = require('fs')
require('./db/mongoose');
const path = require('path');
const { Readable } = require('stream');
const { uploadImageToS3, deleteImageFromS3, getImageFromS3 } = require('./middleware/s3-handlers');
const { Image } = require('./models/imageModel');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// const upload = multer({
//     dest: 'images',
//     fileFilter (req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return cb(new Error('Please upload an image'));
//         }

//         cb(undefined, true);
//     }
// });

const absoluteImagesPath = path.join(__dirname, '../', '/images');

app.get('/', async (req, res) => {
    try {
        res.send('Ok');
    } catch (e) {
        res.status(400).send(e);
    }
});

app.post('/post-image', uploadImageToS3, async (req, res) => {
    console.log(req.file);
    if (!req.file) {
        res.status(422).send({
            code: 422,
            message: "file not uploaded"
        });
    }

    const image = new Image({
        originalName: req.file.originalname,
        storageName: req.file.key.split("/")[1],
        bucket: process.env.S3_BUCKET,
        region: process.env.AWS_REGION,
        key: req.file.key
    });

    try {
        await image.save();
        res.send(image);
    } catch(err) {
        res.status(400).send(err);
    }

    // const bitMap = fs.readFileSync(path.join(absoluteImagesPath, req.file.filename));
    // const img = new Buffer.from(bitMap).toString("base64");
    // res.status(200).send({ img, fileName: req.file.filename });
}, (error, req, res, next) => {
    console.log(error)
    res.status(400).send({ error: error.message });
});

app.delete('/delete-image', deleteImageFromS3, async (req, res) => {
    try {
        // fs.unlinkSync(path.join(absoluteImagesPath, req.body.fileName));
        // res.send();
        await Image.findByIdAndDelete(req.body.id);
        res.send();
    } catch(err) {
        res.status(400).send();
    }
});

app.get('/get-all-images', async (req, res) => {
    try {
        // fs.readdir(absoluteImagesPath, (err, files) => {
        //     if (err) throw new Error(err);

        //     files.forEach(file => {
        //         const bitMap = fs.readFileSync(path.join(absoluteImagesPath, file));
        //         images.push({ img: new Buffer.from(bitMap).toString("base64"), fileName: file });
        //     });

        //     res.send(images);
        // });

        const images = await Image.find({});
        if (!images) res.send([]);
        res.send(images);
    } catch (e) {
        res.status(400).send();
    }
});

app.get('/get-image', getImageFromS3, async (req, res) => {
    try {
        const stream = Readable.from(req.imageBuffer);
        const imageName = req.query.name;
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + imageName
        );

        stream.pipe(res);
    } catch {

    }
});

app.listen(port, () => {
    console.log('server connected, port:', port);
});