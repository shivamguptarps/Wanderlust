const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema,reviewSchema } = require("./schema");

const ExpressError = require("./utils/ExpressError");


module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}


module.exports.isLoggedIn = (req,res,next)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create Listing!!");
        return res.redirect("/login"); 
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    // console.log(req.params);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","Only Owner have permission.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId}=req.params;
    console.log("REVIEW");
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","Only Owner have permission.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
    // console.log(req.body);
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((ele)=> ele.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}