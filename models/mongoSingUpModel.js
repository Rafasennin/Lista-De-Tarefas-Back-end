const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
}, {
  collection: 'users' // Especifica explicitamente o nome da coleção
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
