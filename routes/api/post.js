const express = require('express');
const app = express();
const router = express.Router();
const User = require('../../model/User');
const Post = require('../../model/Post');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/', async (req,res)=> {
   const results = await getPosts({});
   res.status(200).send(results);
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

    if(req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
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

router.get('/:id',async (req,res)=> {
    const postId = req.params.id;
    
    let results = await getPosts({ _id: postId });
    results = results[0];
    res.status(200).send(results);
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

router.post("/:id/retweet", async(req,res)=> {
    
    const postId = req.params.id;
    const userId = req.session.user._id;

    const deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
    .catch(err => {
        console.log(err.message);
        res.sendStatus(400);
    })
    const option = deletedPost != null ? "$pull" : "$addToSet"
    let repost = deletedPost;

    if(repost === null) {
        repost = await Post.create({ postedBy: userId, retweetData: postId })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })
    }

    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id } }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    })

    const post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId} }, { new: true })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    })

    res.status(200).send(post);
})

async function getPosts(filter) {
    let results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ "createdAt": -1 })
    .catch(err => console.log(err))

    results = await User.populate(results, { path: "replyTo.postedBy" });
    return await User.populate(results, { path: "retweetData.postedBy" });
    
}

module.exports = router;