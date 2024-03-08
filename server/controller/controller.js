const { Userdb, Task, Category } = require("../model/model");
const bcrypt = require("bcrypt");

// hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

//session array
const session = {};

exports.signup = async (req, res) => {
  try {
    console.log("Signup is Running");

    const { fname, lname, mobilenumber, email, password, cpassword } = req.body;

    if (password == cpassword) {
      const hashed_password = await hashPassword(password);

      const defaultCategory = new Category({
        name: "Todo",
        user: null,
      });

      const user = await Userdb({
        fname,
        lname,
        mobilenumber,
        email,
        password: hashed_password,
        categories: [defaultCategory],
      });

      defaultCategory.user = user._id;

      await Promise.all([user.save(), defaultCategory.save()])
        .then((result) => {
          console.log("User and Default Category Saved Successfully-->", user);
          res.redirect("/login");
        })
        .catch((err) => {
          console.error("Error while saving promises:", err);
        });
    } else {
      console.log("Password not matching");
      res.status(400).send("Password not matching");
    }
  } catch (error) {
    console.log("Error while signup", error);
    res.status(500).send(`Error while signup ${error}`);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Userdb.findOne({ email: email });
    req.session.user = user;
    console.log("session will be activated with", req.session.user._id);
    if (user) {
      const passwordMatched = await bcrypt.compare(password, user.password);
      if (passwordMatched) {
        console.log(user._id, "->loggedin");
        res.redirect("/home");
      } else {
        console.log("Password wrong");
        res.status(401).send("Kindly Enter correct password");
      }
    } else {
      console.log("no user found");
      return res.status(401).redirect("/signup");
    }
  } catch (error) {
    console.log(`Error while Logging in-> ${error}`);
    res.status(500).send(`Error while Logging in-> ${error}`);
  }
};

//add category
exports.addCategory = async function (req, res) {
  try {
    const { id: userid } = req.params;
    const { name } = req.body;
    console.log("userid-->", userid);

    console.log("category name->", name);
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }

    const user = await Userdb.findOne({ _id: userid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newCategory = Category({
      name: name,
      user: userid,
    });

    user.categories.push(newCategory);

    await Promise.all([user.save(), newCategory.save()])
      .then(([userResult, categoryResult]) => {
        console.log("Updated User Data:", userResult);
        console.log("New category Added:", categoryResult);
        res.redirect(`/dashboard/${userid}`);
      })
      .catch((error) => {
        console.error("Error while saving user or category:", error);
        res
          .status(500)
          .json({ message: "Error while saving user or category" });
      });
  } catch (error) {
    console.log(`Error while adding category ${error}`);
    res
      .status(500)
      .json({ message: `Error while adding category: ${error.message}` });
  }
};

//add task
exports.add_Task = async (req, res) => {
  try {
    const { id: userid } = req.params;

    const user = await Userdb.findOne({ _id: userid });
    if (!user) {
      console.log("No user Found");
      res.status(500).send("User Not Found");
    }

    const { name, date, category } = req.body;
    const cate = await Category.findOne({ _id: category });

    if (!category) {
      console.log("No category Found");
      res.status(500).send("category Not Found");
    }
    console.log("Task to be added to User and Category", user, cate);
  
    const currentDate = new Date(date).toDateString();
    console.log("Current Date is ",currentDate);
 
    const task = await Task.create({
      title: name,
      date: currentDate,
      user: user._id,
      categories: cate._id,
    });

    user.tasks.push(task._id);
    user.taskInCompleted.push(task._id);
    cate.tasks.push(task._id);
    await Promise.all([task.save(), user.save(), cate.save()])
      .then((taskResult, userResult, cateResult) => {
        console.log(
          "Task Added",
          taskResult,
          "Successfully to ",
          userResult,
          cateResult
        );
        res.redirect(`/dashboard/${user._id}`);
      })
      .catch((error) => {
        console.log("Error while saving error", error);
        res.status(500).send({ error: "Server Error" });
      });
  } catch (error) {
    console.log(`Error while Adding task ${error}`);
    res.status(500).send({ error: "Server Error!" });
  }
};


//edit Task
exports.edit_Task = async(req,res)=>{
    try{
        const {id:taskid} = req.params;
        
        console.log(taskid);
        const {name,date,category} = req.body;
        console.log("New Category-->", category);
        
        const task = await Task.findOne({_id:taskid});
        const oldcateid = task.categories;
        const user = task.user;
        
        if(!user){
           res.status(400).json({error:"User Not found"});
        }

        if (!name || !date) {
            return res.status(400).json({ error: "Name and date are required for the update" });
          }
         
           
           const currentDate = new Date(date).toDateString();
           console.log("Current Date is ",currentDate);

          //updateTask
           const updatedTask = await Task.findByIdAndUpdate(
               taskid,
               { title:name,date: currentDate,categories:category },
               { new: true } 
           );

            //update to new category
            const newCategory = await  Category.findOne({ _id: category });
            console.log("New Category Is-->",category);
            if(!category){
             res.status(400).json({error:"Category Not found"});
            }
 
            try {
               newCategory.tasks.push(taskid);
                await newCategory.save();
                console.log("Category Saved");
            } catch (error) {
               console.error("Error updating category tasks array", error);
            }
 
            //delete from old category
          const oldCategory = await Category.findOneAndUpdate(
            { _id: oldcateid },
            { $pull: { tasks: taskid } },
            { new: true }
          );

          if (!oldCategory) {
            return res.status(404).json({ error: "Category not found" });
          }

          
           if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
          }
        
           console.log("Task updated successfully", updatedTask);
           res.redirect(`/dashboard/${user._id}`);
        }catch(error){
          console.log("Error while Updating task",error);
          res.status(500).send({error:"Server Error!"});
        } 
   }

//delete Task
exports.delete_Task = async (req,res) =>{
  try {
     
    const {id:taskId} = req.params;
    const task = await Task.findByIdAndDelete(taskId);
    console.log("Deleted the task ", task);


    const category = await Category.findOneAndUpdate(
      {_id:task.categories},
      { $pull : {tasks:taskId}},
      {new: true}
    ).then((category)=>{
      console.log("Task Deleted From Category",category);
    }).catch((err)=>{
      console.log("Error while Deleting Task from Category:",err);
    })


    const user = await Userdb.findOneAndUpdate(
      {_id: task.user},
      {$pull:{tasks:taskId}},
      { new: true }
    ).then((user)=>{
      console.log("Task Deleted From user",user);
    }).catch((err)=>{
      console.log("Error while Deleting Task from user:",err);
    })
    

    console.log("Task deleted successfully", task);
    res.redirect(`/dashboard/${task.user}`);

    
  } catch (error) {
    console.log(`Error while Deleting Task ${error}`);
    res.status(500).send({error:`Error while Deleting Task`});
  }
}   

// mark completed
exports.markCompleted = async (req,res) =>{

    try {
      const { id: taskId } = req.params;
      const task = await Task.findById(taskId);
      const user = await Userdb.findById(task.user);
     let updatedTask;

      if (!task.completed) {
         
          updatedTask = await Task.findByIdAndUpdate(taskId, { completed: true }, { new: true });
          if (!updatedTask) {
              return res.status(404).send({ error: 'Task not found' });
          }
  
          user.taskCompleted.push(updatedTask._id);
          user.taskInCompleted.pull(updatedTask._id);
          await user.save();
         
      } else {

        updatedTask = await Task.findByIdAndUpdate(taskId, { completed: false }, { new: true });
        if (!updatedTask) {
        return res.status(404).send({ error: 'Task not found' });
       }

        user.taskInCompleted.push(updatedTask._id);
        user.taskCompleted.pull(updatedTask._id);
        await user.save();
      }

      console.log(`Task Completed ${updatedTask.completed} --> ${taskId}`);
      res.status(200).json(`Task Marked As ${updatedTask.completed}-->${updatedTask}`); 
  
  } catch (error) {
      console.log(`Error in Marking Completed ${error}`);
      res.status(500).send({ error: 'Error in Marking Completed' });
  }
  

}

//delete category
exports.delete_category = async (req, res) => {
  try {

    const { id: categoryId } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    
    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    const user = await Userdb.findOneAndUpdate(
      { _id: deletedCategory.user },
      { $pull: { categories: deletedCategory._id } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Category deleted successfully", deletedCategory);
    res.redirect(`/dashboard/${user._id}`);

  } catch (error) {
    console.log(`Error in deleting the category : ${error}`);
    res.status(500).json(`Error in deleting the category : ${error}`);
  }
};
