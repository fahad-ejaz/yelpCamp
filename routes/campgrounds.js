const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require("multer");
const { storage } = require('../cloudinary')
const upload = multer({ storage }).array('campground[images]');


const Campground = require('../models/campground');




router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload, validateCampground, catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.get('/help', async (req, res, next) => {
    const campgrounds = await Campground.find({});
    // console.log("hello")
    res.send(JSON.stringify(campgrounds))
    // res.send("hello help")
})

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))




module.exports = router;