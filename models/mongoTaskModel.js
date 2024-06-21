const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    author: String,
    title: String,
    date: String,
    text: String,  
    reminderDate: String,
    reminderHour: String, 
});

const TaskModel = mongoose.model('users-list', taskSchema);

module.exports = TaskModel;
