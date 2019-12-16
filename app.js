var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var Campground = require("./models/campground");
var Comment = require('./models/comment');
var seedDB = require("./seeds");


mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
seedDB();

// Campground.create({
//     name: "TY Park", 
//     image: "https://pixabay.com/get/50e9d4474856b108f5d084609620367d1c3ed9e04e50744e702c7add934fcc_340.jpg",
//     description: "Lovely place to relax and enjoy all that nature has to offer."
// }, function(err, campground){
//     if(err){
//         console.log("SOMETHIGN WENT WRONG!");
//         console.log(err);
//     } else {
//         console.log("ADDED TO DB");
//         console.log(campground);
//     }
// });



app.get("/", function(req, res){
    res.render("landing");
});
//INDEX - Shows all campground. 
app.get("/campgrounds", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err)
        } else {
            res.render("campgrounds/index", { campgrounds:allCampgrounds });
        }
    })
   //res.render("campgrounds", {campgrounds: campgrounds});
});

//CREATE - pushes campground to DB and redirects to index 
app.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampGround = {name: name, image: image, description: desc};
    Campground.create(newCampGround, function(err, newlyCreated){
        if(err){
            console.log("DID NOT SAVE!")
        } else {
            res.redirect("/campgrounds")  //when you do a redirect default is a get request!
        }
    })
});
//NEW- form to create a new campground GET
app.get("/campgrounds/new", function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground GET
app.get("/campgrounds/:id", function(req, res){
    //Find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that campgroundS});
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


//==================
//COMMENTS ROUTES
//==================

app.get("/campgrounds/:id/comments/new", function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground}); 
        }
    });
 });

app.post('/campgrounds/:id/comments', function(req, res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            }); 
        }
    });

    //redirect campground show page 

});

app.listen(3000, function(){
    console.log("Server Started");
});