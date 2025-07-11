const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin.ejs';

const jwtSecret = process.env.JWT_SECRET;
// Middleware to parse JSON bodies
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch(error){
       return res.status(401).json({ message: 'Unauthorized' });
    }
};

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/admin', (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        res.render('admin/index', { locals, layout: adminLayout });
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});



router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});



router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Compare password with hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );
        
        res.json({ message: 'Login successful', token });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;      
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try{
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User created successfully' });
        }
        catch(error){
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/dashboard',authMiddleware, async (req, res) => {
    try{
        const locals = {
            title: "Dashboard",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

    
    const data = await Post.find();
    res.render('admin/dashboard', { locals,data,layout:adminLayout});
    }
    catch(error){
        console.log(error);
    }
});

router.get('/add-post',authMiddleware, async (req, res) => {
    try{
        const locals = {
            title: "Add-Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

    
    const data = await Post.find();
    res.render('admin/add-post', { locals,layout:adminLayout});
    }
    catch(error){
        console.log(error);
    }
});

router.post('/add-post',authMiddleware, async (req, res) => {
   try{
     res.redirect('/dashboard');
     try{
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body,
        });
        await Post.create(newPost);
        res.redirect('/dashboard');
     }
     catch(error){
        console.log(error);
     }
   }
   catch(error){
    console.log(error);
   }
});


router.get('/edit-post/:id',authMiddleware, async (req, res) => {
    try{
      const locals = {
      title: "Edit-Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    const data = await Post.findOne({_id:req.params.id});
    res.render('admin/edit-post', { locals,data,layout:adminLayout});
    }
    catch(error){
        console.log(error);
    }
});

router.put('/edit-post/:id',authMiddleware, async (req, res) => {
    try{
       await Post.findByIdAndUpdate(req.params.id, {    
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
       });
       res.redirect(`/edit-post/${req.params.id}`);
    }
    catch(error){
        console.log(error);
    }
});

router.delete('/delete-post/:id',authMiddleware, async (req, res) => {
    try{
       await Post.findByIdAndDelete({_id:req.params.id} );
       res.redirect(`/dashboard`);
    }
    catch(error){
        console.log(error);
    }
});

router.get('/logout',authMiddleware, async (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});





module.exports = router;