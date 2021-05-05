const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        trim: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pinned: Boolean,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    retweetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    retweetData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
}, { timestamps: true });

module.exports = mongoose.model("Post",postSchema);