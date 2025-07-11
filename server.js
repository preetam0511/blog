require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = process.env.PORT || 3000;

const connectDB = require('./server/config/db');

app.use(express.static('public'));
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
app.use(expressLayout);
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create(
    {mongoUrl: process.env.MONGODB_URI})

}));
connectDB().then(async () => {
  console.log('✅ DB Connected');

  // Load model here
  const Post = require('./server/models/Post');

  // Insert post data only once
  async function insertPostData() {
    const count = await Post.countDocuments();
    if (count === 0) {
      console.log('⏳ Seeding post data...');
      await Post.insertMany([
        { title: "Building a Blog", body: "This is the body text" },
        { title: "Deployment of Node.js applications", body: "Deployment details..." },
        { title: "Authentication and Authorization", body: "Using Passport.js..." },
        { title: "MongoDB and Mongoose", body: "Working with MongoDB..." },
        { title: "Real-time apps", body: "Using Socket.io..." },
        { title: "Express.js", body: "Using Express..." },
        { title: "Async Programming", body: "Async/await, promises..." },
        { title: "Node.js Basics", body: "What is Node.js..." },
        { title: "Network Traffic", body: "Limiting network traffic..." },
        { title: "Morgan Logger", body: "Using Morgan..." }
      ]);
      console.log('✅ Posts seeded!');
    }
  }

  await insertPostData(); // <- Only after DB connection is ready

  // Mount routes
  app.use('/', require('./server/routes/main'));
  app.use('/', require('./server/routes/admin'));

  app.listen(port, () => {
    console.log(`✅ App listening on port ${port}`);
  });
});
