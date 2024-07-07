const Listing = require("../models/listing.js")
const Review = require("../models/review.js")

const {reviewSchema} = require("../schema.js");

module.exports.createReview=async(req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created Successfully");
    res.redirect(`/listings/${id}`);
    // console.log(req.body);
};

module.exports.destroyReview = async(req,res,next)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted Successfully");
    res.redirect(`/listings/${id}`);
};