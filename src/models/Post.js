import mongoose from 'mongoose'
const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment"
    }]
})
const Post = mongoose.model('post', PostSchema);
export default Post