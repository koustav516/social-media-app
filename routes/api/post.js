const express = require('express');
const app = express();
const router = express.Router();
const User = require('../../model/User');
const Post = require('../../model/Post');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/',(req,res)=> {
   Post.find()
   .populate("postedBy")
   .sort({ "createdAt": -1 })
   .then(results => res.status(200).send(results))
   .catch(err => {
       console.log(err);
       res.sendStatus(400);
   })
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

router.put("/:id/like", async(req,res)=> {
    
    const postId = req.params.id;
    const userId = req.session.user._id;

    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    const option = isLiked ? "$pull" : "$addToSet"

    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    })

    const post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId} }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    })

    res.status(200).send(post);
})

module.exports = router;