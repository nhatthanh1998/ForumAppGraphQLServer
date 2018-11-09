import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: Number
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    }
})

const Comment = mongoose.model('comment', CommentSchema)
export default Comment