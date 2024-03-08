const express = require("express");
const dotenv = require("dotenv");
const bodyparser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const  app = express();


//env
dotenv.config({path:'config.env'})
const PORT = process.env.PORT || 8080

//db
const connectDB = require('./server/db/db');

//middleware
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({extended:true}))
app.use(cookieParser());


const oneDay = 24 * 60 * 60 * 1000;

//session
app.use(session({
    secret: process.env.Session_Key,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: oneDay,
        httpOnly: true,
        sameSite: 'strict'
    }
}));

//view engine
app.set("view engine","ejs");

connectDB();

//assets
app.use('/css',express.static(path.resolve(__dirname,"assets/css")));
app.use('/js',express.static(path.resolve(__dirname,"assets/js")));
app.use('/img',express.static(path.resolve(__dirname, "assets/img")))

//routes
app.use("/",require("./server/routes/routes") );

app.listen(PORT, ()=>{
    console.log(`Server is Connected to http://localhost:${PORT}/`);
})

