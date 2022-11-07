const fs = require('fs');
// tensorflowjs_converter--input_format keras tf_model.h5./ jsmodel /
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
let imagePixels = require('image-pixels')
let Jimp = require('jimp');
const tf = require("@tensorflow/tfjs");
const tfn = require("@tensorflow/tfjs-node");
const handler = tfn.io.fileSystem("./jsmodel/model.json");
const data = require('./data');
const { count } = require('console');



const imageDecoder = async (pikels) => {
    try {
        const model = await tf.loadLayersModel(handler);
        const predictionData = await data.convertPixels(pikels);
        const ans2d = model.predict(predictionData, { batchSize: 1 }).arraySync()
        const ans = ans2d[0];
        console.log(ans, 'HEYYEY');
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

const getData = async (filename) => {
    let { data, width, height } = await imagePixels(filename)
    let pixels = [];
    for (let i = 0; i < data.length; i = i + 4) {
        let ag = data[i] + data[i + 1] + data[i + 2];
        pixels.push(Math.ceil(ag / 3));
    }
    for (let i = 0; i < 28; ++i) {
        for (let j = 0; j < 28; ++j) {
            process.stdout.write(`${pixels[28 * i + j]}  `)
        }
        console.log();
    }
    console.log(pixels.length, 'Cou')
    fs.unlinkSync(filename);
    return pixels;
}
const fileToData = async (filename) => {
    const tempAddr = filename.slice(filename.lastIndexOf('/'));
    const modFileName = './uploads/temp2' + tempAddr;
    const image = await Jimp.read(filename);
    image
        .grayscale()
        .threshold({ max: 130 })
        .invert()
        .resize(28, 28)
    await image.writeAsync(modFileName);
    console.log("image modded")
    const pixels = await getData(modFileName);
    return pixels;
}

const upload2 = multer({ storage: storage2 })

app.post('/upload2', upload2.single('image'), async (req, res) => {
    const oldPath = `./uploads/temp/${FileName}`
    const pixels = await fileToData(oldPath);
    const label = await imageDecoder(pixels);
    console.log('Label : ', label);
    let newPath = `./uploads/${Math.abs(label)}/${FileName}`
    fs.renameSync(oldPath, newPath);
    console.log(newPath);
    res.send(JSON.stringify({ "status": "uploaded" }));
})

app.listen(3000);
console.log('listening on 3000');

function createDirs() {
    for (let i = 0; i < 10; ++i) {
        let dir = `./uploads/${Math.abs(i)}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

    }
}
// createDirs();