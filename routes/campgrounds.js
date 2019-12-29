var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');

//INDEX - Shows all campground. 
router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err)
        } else {
            res.render("campgrounds/index", { campgrounds:allCampgrounds, currentUser: req.user });
        }
    })
   //res.render("campgrounds", {campgrounds: campgrounds});
});

//CREATE - pushes campground to DB and redirects to index 
router.post("/", isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._d,
        username: req.user.username
    }
    var newCampGround = {name: name, image: image, description: desc, author: author};
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
router.get("/new", isLoggedIn, function(req, res){
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
router.get('/:id/edit', function(req, res){
    //is user logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                res.redirect('/campgrounds');
            } else {
                //does user own campground?
                if(foundCampground.author.id.equals(req.user._id)){
                    res.render('campgrounds/edit', {campground: foundCampground});
                } else {
                    res.send("YOU DO NOT HAVE PERMISION TO DO THAT!");
                }
            }
        });
    } else {
        console.log('You need to be logged in to do that!');
        res.send('You need to be logged in to do that!');
    }
        
    //if not redirect 

});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", function(req, res){
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
router.delete("/:id", function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}
module.exports = router;