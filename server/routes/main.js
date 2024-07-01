const express = require('express');
const router = express.Router();
const Post = require('../model/Post');


//Routes
/**
 * GET /
 * HOME
 */
router.get('', async(req, res) => {

    try{
        const locals = {
            title: "NodeJS Blog",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        let perPage = 5;
        let page = req.query.page || 1;
        
        const data = await Post.aggregate([{$sort: {createdAt: -1}}])
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec();
        const count = await Post.countDocuments();
        const nextPage = parseInt(count) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', { 
            locals, 
            data, 
            current: page,
            nextPage: hasNextPage ? nextPage : null,
        });
        

       
    } catch(error){
        console.error(error);
    }
});
/**
 * GET /
 * Post :id
 */
router.get('/post/:id', async(req, res) => {

    try{
        let slug = req.params.id;
        const data = await Post.findById({_id: slug});
        const locals = {
            title: data.title,
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        res.render('post', {locals, data});
    } catch(error){
        console.error(error);
    }

    
});
/**
 * POST /
 * Search
 */
router.post('/search', async(req, res) => {

    try{
        const locals = {
            title: "Search Blog",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChars, "i") }},
                { body: { $regex: new RegExp(searchNoSpecialChars, "i") }}
            ]
        });

        res.render("search", {locals, data});
        

       
    } catch(error){
        console.error(error);
    }
});

router.get('/about', (req, res) => {
    res.render('about');
});

module.exports = router;