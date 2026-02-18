const QRCode = require('qrcode');
const path = require('path');
const url = 'https://link.coupang.com/a/dlUWd';
const artifactsDir = 'C:/Users/acepa/.gemini/antigravity/brain/a37d976d-792b-4c1e-abd9-feb7377cb811';
const outputPath = path.join(artifactsDir, 'coupang_qr.png');

QRCode.toFile(outputPath, url, {
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    },
    width: 600,
    margin: 2
}, function (err) {
    if (err) throw err;
    console.log('✅ QR code saved to ' + outputPath);
});
