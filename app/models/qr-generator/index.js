const qr = require('qr-image')
    , fs = require('fs');

/**
 * QR Generator class.
 * @constructor
 */

class QRGenerator {
    constructor() {
        this.qr = qr;
        this.generateQR('https://google.com', 'qr.png', {margin: 1, size: 10})
    };


    /**
     * Generate QR code stream
     * @param {string} text - text of which wee need to generate QR
     * @param {object} options - options for QR Generator
     * @returns {Promise} - promise with result of creating QR code
     */

    generateQR(text, filename, options = {}) {
        return new Promise((resolve, reject) => {
            let fullPath = __dirname + '/../../../public/qrCodes/';
            filename = filename.includes('.') ? filename : filename + '.png';

            let stream = this.qr.image(text, options)
                .pipe(fs.createWriteStream(fullPath + filename));

            stream.on('close', resolve);
            stream.on('error', reject);
        });
    };


    /**
     * Generate QR code stream
     * @param {string} text - text of which wee need to generate QR
     * @param {object} options - options for QR Generator
     * @returns {Promise} - promise with result of creating QR code
     */

    generateQRMatrix(text, options = {}) {
        return new Promise((resolve, reject) => {
            resolve(this.qr.matrix(text, options));
        });
    }

}

const qrGenerator = new QRGenerator();

module.exports = qrGenerator;
