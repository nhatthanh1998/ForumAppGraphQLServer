import {
    Post,
    Comment,
    User
} from '../../models'
import {
    pubsub
} from '../index'
import mongoose from 'mongoose'
import {
    ensure_token
} from '../middleware'

function modifyCriteria(criteria) {
    var modifiedCriteria = {}
    if (criteria._id) {
        modifiedCriteria = {
            ...modifiedCriteria,
            _id: criteria._id
        }
    }
    if (criteria.createdAt) {
        modifiedCriteria = {
            ...modifiedCriteria,
            createdAt: criteria.createdAt
        }
    }
    if (criteria.author) {
        modifiedCriteria = {
            ...modifiedCriteria,
            author: criteria.author
        }
    }
    if (criteria.post) {
        modifiedCriteria = {
            ...modifiedCriteria,
            post: criteria.post
        }
    }
    if (criteria.content) {
        modifiedCriteria = {
            ...modifiedCriteria,
            content: new RegExp(criteria.content, 'i')
        }
    }
    return modifiedCriteria
}

function modifyMutation(criteria) {
    var modifiedCriteria = {}
    if (criteria._id) {
        modifiedCriteria = {
            ...modifiedCriteria,
            _id: criteria._id
        }
    }
    if (criteria.author) {
        modifiedCriteria = {
            ...modifiedCriteria,
            author: criteria.author
        }
    }
    if (criteria.post) {
        modifiedCriteria = {
            ...modifiedCriteria,
            post: criteria.post
        }
    }
    if (criteria.createdAt) {
        modifiedCriteria = {
            ...modifiedCriteria,
            createdAt: criteria.createdAt
        }
    }
    if (criteria.content) {
        modifiedCriteria = {
            ...modifiedCriteria,
            content: criteria.content
        }
    }
    return modifiedCriteria
}

export const Query = {
    async comments({
        criteria,
        skip,
        limit
    }) {
        return await Comment
            .find(...modifyCriteria(criteria))
            .populate('author')
            .populate('post')
            .skip(skip)
            .limit(limit)
            .lean()
    }
}
export const Mutation = {
    async addComment(_, {
        comment
    }) {
        var parseUser = await ensure_token(comment.token)
        if (parseUser === null) {
            throw Error("Invalid token")
        }
        var user = await User.findById(parseUser._id)
        var post = await Post.findById(comment.post)

        if (post) {
            comment._id = new mongoose.Types.ObjectId().toString()
            comment.author = user._id.toString()
            comment.post = post._id.toString()
            comment.createdAt = new Date().getTime()
            var newComment = await Comment.create({
                ...modifyMutation(comment)
            })
            post.comments.push(newComment)
            await post.save()
            pubsub.publish('commentAdded', {
                commentAdded: newComment
            })
            return newComment
        } else {
            throw Error("Post not founded")
        }
    },
    async updateComment(_, {
        comment
    }) {
        var parseUser = await ensure_token(comment.token)
        if (parseUser === null) {
            throw Error("Invalid token")
        }
        var updateComment = await Comment.findById(comment._id)
        if (updateComment) {
            if (updateComment.author.toString() === author._id.toString()) {
                comment.post = false
                comment.author = false
                const updatedComment = await Comment.findByIdAndUpdate(comment._id, {
                    $set: {
                        ...modifyMutation(comment)
                    }
                }, {
                    new: true
                })

                pubsub.publish('commentUpdated', {
                    commentUpdated: updatedComment
                })
                return updatedComment
            } else {
                throw Error("Not comment Author")
            }
        } else {
            throw Error("Comment not founded")
        }
    },
    async deleteComment(_, {
        comment
    }) {
        var parseUser = await ensure_token(comment.token)
        var deleteComment = await Comment.findById(comment._id)
        if (deleteComment) {
            var user = await User.findById(parseUser._id)
            if (user._id.toString() === deleteComment.author.toString()) {
                var post = await Post.findById(comment.post)
                post.comments = post.comments.filter(items => items._id !== deleteComment._id)
                await post.save()
                var deletedComment = await Comment.findByIdAndDelete(comment._id)
                pubsub.publish("commentDeleted", {
                    commentDeleted: deletedComment
                })
                return deletedComment
            } else {
                throw Error("Not comment author")
            }
        } else {
            throw Error("Comment not founded")
        }
    }
}

export const Subscription = {
    commentAdded: {
        subscribe: () => pubsub.asyncIterator('commentAdded'),
        resolve: payload => payload.commentAdded
    },
    commentUpdated: {
        subscribe: () => pubsub.asyncIterator('commentUpdated'),
        resolve: payload => payload.commentUpdated
    },
    commentDeleted: {
        subscribe: () => pubsub.asyncIterator('commentDeleted'),
        resolve: payload => payload.commentDeleted
    }
}