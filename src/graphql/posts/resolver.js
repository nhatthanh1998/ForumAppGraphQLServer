import {
    Post,
    User
} from '../../models'
import mongoose from 'mongoose'
import 'babel-polyfill'
import {
    ensure_token
} from '../middleware'
import {
    pubsub
} from '../index'

function modifyCriteria(criteria) {
    let modifiedCriteria = {}
    if (criteria._id) {
        modifiedCriteria = {
            ...modifiedCriteria,
            _id: criteria._id
        }
    }
    if (criteria.title) {
        let titleRegex = new RegExp(criteria.title, 'i')
        modifiedCriteria = {
            ...modifiedCriteria,
            title: titleRegex
        }
    }
    if (criteria.content) {
        let titleRegex = new RegExp(criteria.content, 'i')
        modifiedCriteria = {
            ...modifiedCriteria,
            content: titleRegex
        }
    }
    if (criteria.createdAt) {
        modifiedCriteria = {
            ...modifiedCriteria,
            createdAt: criteria.createdAt
        }
    }
    if (criteria.authorID) {
        modifiedCriteria = {
            ...modifiedCriteria,
            content: criteria.content
        }
    }
    return modifiedCriteria
}


function modifyMutation(input) {
    let modifiedMutation = {}
    if (input.title) {
        modifiedMutation = {
            ...modifiedMutation,
            title: input.title
        }
    }
    if (input.content) {
        modifiedMutation = {
            ...modifiedMutation,
            content: input.content
        }
    }
    if (input._id) {
        modifiedMutation = {
            ...modifiedMutation,
            _id: input._id
        }
    }
    if (input.createdAt) {
        modifiedMutation = {
            ...modifiedMutation,
            createdAt: input.createdAt
        }
    }
    if (input.author) {
        modifiedMutation = {
            ...modifiedMutation,
            author: input.author
        }
    }
    if (input.comments) {
        modifiedMutation = {
            ...modifiedMutation,
            comments: input.comments
        }
    }
    return modifiedMutation
}

export const Query = {
    async post(_, {
        where
    }) {
        return await Post
            .findOne(where)
            .populate('author')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    model: 'user'
                }
            }).lean()
    },
    async posts(_, {
        criteria,
        skip,
        limit
    }) {
        return await Post
            .find({ ...modifyCriteria(criteria)
            })
            .populate('author')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    model: 'user'
                }
            })
            .skip(skip)
            .limit(limit)
            .lean()
    }
}


export const Mutation = {
    async addPost(_, {
        post
    }) {
        var parseUser = await ensure_token(post.token)
        if (parseUser === null) {
            throw Error("Invalid token")
        }
        var user = await User.findById(parseUser._id)
        post.createdAt = new Date().getTime()
        post.author = user._id.toString(),
            post.comments = []
        post._id = new mongoose.Types.ObjectId().toString()

        let modifiedMutation = modifyMutation(post)
        let newPost = await Post.create({
            ...modifiedMutation
        })
        user.posts.push(newPost)
        await user.save()
        pubsub.publish('postAdded', {
            postAdded: newPost
        })
        return newPost
    },
    async updatePost(_, {
        post
    }) {
        var parseUser = await ensure_token(post.token)
        if (parseUser === null) {
            throw Error("Invalid token")
        }
        var updatePost = await post.findById(post._id)
        if (parseUser._id.toString() === updatePost.author.toString()) {
            var updatedPost = await Post.findByIdAndUpdate(post._id, {
                $set: {
                    ...modifyMutation(post)
                }
            }, {
                new: true
            }).lean()
            pubsub.publish('updatedPost', {
                updatedPost
            })
            return updatedPost
        } else {
            throw Error("Not author of this post")
        }
    },
    async deletePost(_, {
        post
    }) {
        var parseUser = await ensure_token(post.token)
        if (ensure_token === null) {
            throw Error("Invalid token")
        }
        var user = await User.findById(parseUser._id)
        var deletePost = await Post.findById(post.postID)
        if (deletePost) {
            if (deletePost.author.toString() === user._id.toString()) {
                await deletePost.remove()
                //PUBLISH EVENT DELETE POST
                pubsub.publish('postDeleted', {
                    deletedPost: deletePost
                })
                return deletePost
            } else {
                throw Error("Not Post Author")
            }
        } else {
            throw Error("Post Not Founded")
        }
    }
}

export const Subscription = {
    postAdded: {
        subscribe: () => pubsub.asyncIterator('postAdded'),
        resolve: payload => payload.postAdded
    },
    postUpdated: {
        subscribe: () => pubsub.asyncIterator('postUpdated'),
        resolve: payload => payload.postUpdated
    },
    postDeleted: {
        subscribe: () => pubsub.asyncIterator('postDeleted'),
        resolve: payload => payload => payload.postDeleted
    }
}