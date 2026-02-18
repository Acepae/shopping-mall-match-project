const qrcode = require('qrcode-terminal');
const url = 'https://link.coupang.com/a/dlUWd';
qrcode.generate(url, { small: true });
