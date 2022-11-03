const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

class MnistDataset {
    constructor() {
        this.dataset = null;
        this.trainSize = 0;
        this.testSize = 0;
        this.trainBatchIndex = 0;
        this.testBatchIndex = 0;
    }


    async convertPixels(pixels) {

        const imagesShape = [1, 28, 28, 1];
        const image = new Float32Array(tf.util.sizeFromShape(imagesShape));
        image.set(pixels);
        return tf.tensor4d(image, imagesShape);
    }
}

module.exports = new MnistDataset();