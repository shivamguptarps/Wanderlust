const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken : mapToken});

module.exports.index=async(req,res)=>{
    const allListings = await Listing.find();
    res.render("./listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res)=>{
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id}=req.params; 
    // console.log(id);
    const info = await Listing.findById(id).populate({path: "reviews",populate :{path : "author"}}).populate("owner");
    if(!info){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings"); 
    }
    console.log(info);
    res.render("./listings/show.ejs",{info})
};

module.exports.createListing = async(req,res,next)=>{
    let responseG = await geocodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit : 1,
    })
    .send();
    
    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url,filename);
    const newListing = new Listing(req.body.listing);
 newListing.owner=req.user._id;
 newListing.image ={url,filename};
 newListing.geometry = responseG.body.features[0].geometry;
let rs= await newListing.save();
console.log(rs);
 req.flash("success","New Listing Created Successfully");
 res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res)=>{
    let {id}=req.params; 
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    else{
        let originalImageUrl =listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("./listings/edit.ejs",{listing,originalImageUrl})
}
};

module.exports.updateListing  = async(req,res)=>{
    let {id}=req.params;
   let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
   if( typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
   }
    req.flash("success","Listing updated Successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing =async(req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted Successfully");
    res.redirect("/listings");
};