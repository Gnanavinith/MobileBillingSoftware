const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('Connecting to: mongodb://127.0.0.1:27017/mobilebill');

mongoose.connect('mongodb://127.0.0.1:27017/mobilebill')
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
