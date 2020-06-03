const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const methodOverride = require('method-override');


const app = express();

//Mongoose app config

const db = require('./config/keys').MongoURI;

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(() => console.log('Mongo DB Connected'))
.catch((err) => console.log(err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

const PORT = process.env.PORT || 5000;

//Mongoose/model config
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date, 
        default: Date.now
    }
});

const Blog = mongoose.model("Blog", blogSchema);
/*
Blog.create({
    title: "Test Blog",
    image: "https://ichef.bbci.co.uk/news/1024/cpsprodpb/83D7/production/_111515733_gettyimages-1208779325.jpg",
    body: "This is a test post"
})*/

//Redirects from localhost default page to blogs route
app.get('/', (req, res) => {
    res.redirect('/blogs');
})


//Restful Routes
//INDEX route /blogs
app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err) return res.status(404).send('Not found');
        res.render('index', {blogs: blogs});

    })
})

//NEW ROUTE
app.get('/blogs/new', (req, res) => {
    res.render('new');
})
//CREATE ROUTE
app.post('/blogs', (req, res) => {
    //create blog
    //my code
    /*
    let newBlogPost = new Blog(req.body.blog);
    newBlogPost.save((err) => {
        if(err) return res.status(404).send('Not Found');
        res.redirect('/blogs')
    })*/

    //colt's code
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err) {
            res.render('new')
            console.log('error')
        } else {
            res.redirect('/blogs')
        }

    })
    //redirect to intex
})

//SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
    const id = req.params.id;
    Blog.findById(id, (err, foundBlog) => {
        if(err) return res.status(404).send('Not Found')
        res.render('show', {blog: foundBlog})
    })
})

//EDIT ROUTE
app.get('/blogs/:id/edit', (req, res) => {
    const id = req.params.id;
    Blog.findById(id, (err, foundBlog) => {
        if(err) return res.status(404).send('Not Found')
        res.render('edit', {blog: foundBlog})
    })

})

//UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
    const id = req.params.id;
    const newData = req.body.blog;
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(id, newData, (err, updatedBlog) => {
        if(err) return res.status(404).send('Not Found');
        res.redirect(`/blogs/${id}`);
    })
})


//DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
    //destroy blog
    const id = req.params.id;
    Blog.findByIdAndRemove(id, (err) => {
        if(err) return res.status(404).send('Not Found');
        res.redirect('/blogs');
    })
    //redirect to blogs
})
app.listen(PORT, () => {
    console.log(`Server is starting at PORT ${PORT}`);
})


