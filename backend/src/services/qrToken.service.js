const crypto = require('crypto');

function generateQrToken(queueNumber) {
  const randomString = crypto.randomBytes(12).toString('hex');
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  return `QR-${today}-${queueNumber}-${randomString}`;
}

module.exports = {
  generateQrToken,
};