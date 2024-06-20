const mongoose = require('mongoose');

const mongoSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Criação do model
const userSingUpModel = mongoose.model('Users', mongoSchema);

module.exports = userSingUpModel;
