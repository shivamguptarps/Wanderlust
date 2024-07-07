if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
// console.log(process.env.CLOUD_API_KEY);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

// const MONGO_URL=(process.env.ATLASDB_URL.replace("<password>",encodeURIComponent(process.env.ATLASDB_PASS)));

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine",'ejs');
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));    

main().then(()=>{
    console.log("connect to mongoDB")
}).catch((err)=>{
    console.log(err);
})

let port=8080;


const sessionOptions = {
    secret:process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true, //cross Scripting Atax -> Security Purpose

    }
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(port,()=>{
    console.log("server is listening at port ",port);
})

app.get('/',(req,res)=>{
    res.send("Hey I am ROOT");
})

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/demouser",async (req,res)=>{
    let fakeUser = new User({
        email : "student@gmail.com",
        username : "phase-1"
    });

    let regUser =  await User.register(fakeUser,"helloworld");
    res.send(regUser);
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})

app.use((err,req,res,next)=>{
    let {status=500,message="Something went wrong"} = err;
    res.status(status);
    res.render("./listings/error.ejs",{status,message});
})