const express = require('express');
const app = express();
const router = express.Router();
const User = require('../../model/User');
const Post = require('../../model/Post');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/',(req,res)=> {
   
});

router.post('/',async(req,res)=> {
    if(!req.body.content) {
        console.log('Errorrr');
        return res.sendStatus(400);
    }
    
    const postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, { path: 'postedBy' })
        res.status(201).send(newPost);
    })
    .catch(err => {
        console.log('Error: ',err);
        res.sendStatus(400);
    })
});

module.exports = router;