const mongoose = require('mongoose');


const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"]
    },
    date:{
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Userdb',
        required: true
    },
    categories:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
});

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Userdb',
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
});

const userSchema = mongoose.Schema({
    fname: {
        type: String,
        required: [true, "First name is required"]
    },
    lname: {
        type: String,
        required: [true, "Last name is required"]
    },
    mobilenumber: {
        type: Number,
        required: [true, "Mobile number is required"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    taskCompleted:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    taskInCompleted:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
});

const Task = mongoose.model('Task', taskSchema);
const Category = mongoose.model('Category', categorySchema);
const Userdb = mongoose.model('Userdb', userSchema);

module.exports = {Userdb, Task, Category};
