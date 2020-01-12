var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require("../middleware"); //bc file is named index.js we do not have do add the /index.js

//INDEX - Shows all campground. 
router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log("ERROR-ERROR",err.message)
        } else {
            res.render("campgrounds/index", { campgrounds:allCampgrounds, currentUser: req.user });
        }
    })
   //res.render("campgrounds", {campgrounds: campgrounds});
});

//CREATE - pushes campground to DB and redirects to index 
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampGround = {name: name, price:price, image: image, description: desc, author: author};
    Campground.create(newCampGround, function(err, newlyCreated){
        if(err){
            console.log("DID NOT SAVE!")
        } else {
            console.log(newlyCreated);
            res.redirect("/campgrounds")  //when you do a redirect default is a get request!
        }
    })
});
//NEW- form to create a new campground GET
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground GET
router.get("/:id", function(req, res){
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

//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render('campgrounds/edit', {campground: foundCampground});
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership,function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
           res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTORY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;