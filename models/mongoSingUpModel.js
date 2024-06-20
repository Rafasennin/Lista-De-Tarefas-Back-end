const mongoose = require('mongoose');

const mongoSchema = new mongoose.Schema({
    userName: String,
    email:String,
    password: String,
});

// Criação do model
const userSingUpModel = mongoose.model('users', mongoSchema);

module.exports = userSingUpModel;
