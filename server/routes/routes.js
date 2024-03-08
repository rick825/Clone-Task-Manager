const express = require("express");
const route = express.Router();
const controller = require("../controller/controller");
const { Userdb, Task, Category } = require("../model/model");


route.get('/dashboard/:id', async (req, res) => {
    const userSession = req.session.user;

    if (!userSession) {
        res.redirect("/login");
    } else {
        console.log("Dashboard Page");
        const categories = await Category.find({user: userSession._id});
        const tasksByCategory = [];

        for (const category of categories) {
            const tasks = await Task.find({ user: userSession._id, categories: category._id });
            tasksByCategory.push({ category, tasks });
        }

       const user = await  Userdb.findById(userSession._id);

       console.log("User Db -->", user);
      
        const taskArray = [];

            console.log("User Tasks-->",user.tasks.length);
            var tasksLength = Array.isArray(user.tasks) ? user.tasks.length : 0;
            var taskCompletedLength = Array.isArray(user.taskCompleted) ? user.taskCompleted.length : 0;
            var taskInCompletedLength = Array.isArray(user.taskInCompleted) ? user.taskInCompleted.length : 0;
        
            console.log('Tasks Length:', tasksLength);
            console.log('Task Completed Length:', taskCompletedLength);
            console.log('Task InCompleted Length:', taskInCompletedLength);
        
            taskArray.push({tasksLength, taskCompletedLength, taskInCompletedLength });
        
            console.log("Task Array", taskArray[0].tasksLength);

        
        
        console.log("Tasks by Category-->", tasksByCategory);

        res.render("dashboard", { user, tasksByCategory, taskArray });
    }
});


route.get('/',(req,res)=>{
    console.log("home Page");
    const loggedin = null;
    res.render("index",{ loggedin });
})

route.get('/home',async (req,res)=>{
    const user = req.session.user;
    const loggedin = user._id;
    
    if(!user){return res.redirect("/login")}
    else { 
    console.log("Home Page");
    console.log("Session Activated as-->", user);
    res.render("home",{loggedin,user});
    }
})




route.get('/login',(req,res)=>{
    console.log("Login Page");
    const loggedin = null;
    res.render("login",{loggedin});
})

route.get('/signup',(req,res)=>{
    console.log("Sign Up");
    const loggedin = null;
    res.render('signup',{loggedin});
})


//main
route.post('/api/signup',controller.signup);
route.post('/api/login',controller.login);
route.post('/api/addcategory/:id',controller.addCategory)
route.get('/api/deletecategory/:id',controller.delete_category);
route.post('/api/addtask/:id',controller.add_Task);
route.post('/api/edittask/:id',controller.edit_Task);
route.get('/api/deletetask/:id',controller.delete_Task);
route.post('/api/tasks/:id/complete',controller.markCompleted);
module.exports = route;