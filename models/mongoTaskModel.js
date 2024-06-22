const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    author: String,
    title: String,
    date: String,
    text: String,  
    reminderDate: String,
    reminderHour: String, 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
});

const TaskModel = mongoose.model('users-list', taskSchema);
module.exports = TaskModel;






