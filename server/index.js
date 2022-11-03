const sharp = require('sharp')
const fs = require('fs');
// tensorflowjs_converter--input_format keras tf_model.h5./ jsmodel /
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

var Jimp = require('jimp');

const tf = require("@tensorflow/tfjs");
const tfn = require("@tensorflow/tfjs-node");
const handler = tfn.io.fileSystem("./jsmodel/model.json");
const data = require('./data');

const getData = async (filename) => {

    let dataFileBuffer = fs.readFileSync(filename);
    console.log('lenght', dataFileBuffer.length, 'Bytes', dataFileBuffer.BYTES_PER_ELEMENT)
    let pixels = [];
    for (let y = 0; y <= 27; y++) {
        for (let x = 0; x <= 27; x++) {
            const data = dataFileBuffer[x + (y * 28) + 16];
            if (data == undefined)
                pixels.push(0);
            else
                pixels.push(data);
        }
    }
    return pixels;
}

const imageDecoder = async (pikels) => {
    try {
        const model = await tf.loadLayersModel(handler);
        const predictionData = await data.convertPixels(pikels);
        const ans2d = model.predict(predictionData, { batchSize: 1 }).arraySync()
        const ans = ans2d[0];
        return ans.lastIndexOf(1);
    }
    catch (e) {
        console.log(e);
    }
}
let FileName = '';
const storage2 = multer.diskStorage({
    destination: async (req, file, cb) => {
        cb(null, './uploads/temp');
    },
    filename: (req, file, cb) => {
        FileName = Date.now() + path.extname(file.originalname);
        cb(null, FileName);
    }
})

const fileToData = async (filename) => {
    const tempAddr = filename.slice(filename.lastIndexOf('/'));
    const modFileName = './uploads/temp2' + tempAddr;
    const image = await Jimp.read(filename);
    image
        .rotate(90)
        .grayscale()
        .resize(28, 28)
        .quality(60)
    await image.writeAsync(modFileName);
    console.log("image modded")
    const pixels = await getData(modFileName);
    fs.unlinkSync(modFileName);
    return pixels;
}

const upload2 = multer({ storage: storage2 })

app.post('/upload2', upload2.single('image'), async (req, res) => {
    const oldPath = `./uploads/temp/${FileName}`
    const pixels = await fileToData(oldPath);
    const label = await imageDecoder(pixels);
    console.log('Label : ', label);
    let newPath = `./uploads/${label}/${FileName}`
    fs.renameSync(oldPath,newPath);
    console.log(newPath);
    res.send(JSON.stringify({ "status": "uploaded" }));
})

app.listen(3000);
console.log('listening on 3000');

function createDirs() {
    for (let i = 0; i < 10; ++i) {
        let dir = `./uploads/${i}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

    }
}
// createDirs();