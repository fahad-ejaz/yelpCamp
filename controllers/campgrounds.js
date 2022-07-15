const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary')
const geocode = require('../utils/geocode')
const fetch = require('node-fetch');// import fetch from "node-fetch";



module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    console.log(req.files)
    const images = req.files.map(f => { return { url: f.path, filename: f.filename } })
    const data = { ...req.body.campground, images }
    const campground = new Campground(data);
    campground.geometry = await geocode(campground.location)
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    // const geometry = await geocode(campground.location)
    // console.log(geometry.coordinates)
    // console.log(geometry.coordinates)
    res.render('campgrounds/show', { campground});
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    // res.send(req.body)
    console.log(req.body)
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const newImages = req.files.map(f => { return { url: f.path, filename: f.filename } })
    campground.images.push(...newImages)
    await campground.save();
    console.log(campground.images.length)
    if (req.body.deleteImages) {
        req.body.deleteImages.forEach(filename => {
            cloudinary.uploader.destroy(filename)
        });
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    console.log(campground)
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}