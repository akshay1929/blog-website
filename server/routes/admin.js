const express = require('express');
const router = express.Router();
const Post = require('../model/Post');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin';
const jwtScret = process.env.JWT_SECRET;

/**
 * 
 * Check Login
 */
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        const decoded = jwt.verify(token, jwtScret);
        req.user = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({message: 'Unauthorized'});
    }
}


/**
 * GET /
 * Admin
 */
router.get('/admin', async(req, res) => {

    try{
        const locals = {
            title: "Admin Blog",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        res.render('admin/index', { 
            locals,
            layout: adminLayout
        }); 
    } catch(error){
        console.error(error);
    }
});
/**
 * GET /
 * Admin - Check Login
 */
router.post('/admin', async(req, res) => {

    try{
        const{username, password}= req.body;
        console.log(req.body);
        const user = await User.findOne({username});
        
        if(!user) {
            return res.status(401).json({message: 'Invalid Credentials'});
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword) {
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const token = jwt.sign({userId: user._id}, jwtScret);
        res.cookie('token', token, {httpOnly: true});
        
        res.redirect('/dashboard');
   
    } catch(error){
        console.error(error);
    }
});
/**
 * POST /
 * Admin Dashboard
 */
router.get('/dashboard', authMiddleware, async(req, res) => {

    try {
        const locals = {
          title: 'Dashboard',
          description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
    
        const data = await Post.find();
        res.render('admin/dashboard', {
          locals,
          data,
          layout: adminLayout
        });
    
      } catch (error) {
        console.log(error);
      }
    
    });

/**
 * GET /
 * Admin - Create Post
 */
router.get('/add-post', authMiddleware, async(req, res) => {
    try {
        const locals = {
          title: 'Add New Post',
          description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
    
        res.render('admin/add-post', {
          locals,
          layout: adminLayout
        });
    
      } catch (error) {
        console.log(error);
      }
    
    });
/**
 * POST /
 * Admin - Create Post
 */
router.post('/add-post', authMiddleware, async(req, res) => {
    try {

        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.error(error);
        }
    
      } catch (error) {
        console.log(error);
      }
    
    });

/**
 * GET /
 * Admin - Edit Post
 */
router.get('/edit-post/:id', authMiddleware, async(req, res) => {
    try {
        const locals = {
          title: 'Edit Post',
          description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        
        const data = await Post.findById({_id: req.params.id});
        res.render('admin/edit-post', {
          locals,
          data,
          layout: adminLayout
        });
    
      } catch (error) {
        console.log(error);
      }
    });
/**
 * POST /
 * Admin - Edit Post
 */
router.post('/edit-post/:id', authMiddleware, async(req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });
        res.redirect('/dashboard');
      } catch (error) {
        console.log(error);
      }
    });
/**
 * POST /
 * Admin - Delete Post
 */
router.post('/delete-post/:id', authMiddleware, async(req, res) => {
    try {
        await Post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
      } catch (error) {
        console.log(error);
      }
    });


/**
 * GET /
 * Admin - Logout
 */
router.get('/logout',(req, res) => {
    try {
        res.clearCookie('token');
        res.redirect('/admin');
      } catch (error) {
        console.log(error);
      }
    });
module.exports = router;