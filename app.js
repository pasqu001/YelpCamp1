var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var methodOverride = require('method-override');
var Campground = require("./models/campground");
var Comment = require('./models/comment');
var User = require('./models/user');
var seedDB = require("./seeds");

//requiring routes
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");

mongoose.set('useUnifiedTopology', true);
//LOCAL DATABASE
//mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });

//PRODUCTION DATABASE - MONGODB CLOUD ATLAS
mongoose.connect('mongodb+srv://HarryPotter:Hogwarts@cluster0-2hv3x.mongodb.net/test?retryWrites=true&w=majority', {
     useNewUrlParser: true,
     useCreateIndex: true 
    }).then(() =>{
        console.log('Connected to DB!');
    }).catch(err =>{
        console.log('Error:', err.message);
    });

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.use(flash());
//seedDB(); //seed the database

//PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: "Once upon a time",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(process.env.PORT || 3000, function(){
    console.log("Server Started");
});