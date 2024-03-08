const mongoose = require("mongoose");


const connectDb =   async() =>{
   try {
    const con = await mongoose.connect(process.env.DB_URI)

    console.log(`Mongo is Connected to ${con.connection.host}`);
    console.log("✨✔DB Connection Success✔✨")
   } catch (error) {
    console.log("Error in Connection to DB ->",error);
    process.exit();
   }
}


module.exports = connectDb; 