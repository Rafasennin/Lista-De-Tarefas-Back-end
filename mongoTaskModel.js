const mongoose = require("mongoose") 

const mongoSchema = new mongoose.Schema({
    author: String,
    title: String,
    date: String,
    text: String,  
});

// Criação do model
const MongoTaskModel = mongoose.model('users-list', mongoSchema);

module.exports = MongoTaskModel;