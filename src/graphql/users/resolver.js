import User from '../../models/User'
import mongoose from 'mongoose'
import 'babel-polyfill'
import {
    ensure_token
} from '../middleware'
async function modifyCriteria(criteria) {
    var modifiedInput = {}
    if (criteria._id) {
        modifiedInput = {
            ...modifiedInput,
            id: criteria._id
        }
    }
    if (criteria.displayName) {
        modifiedInput = {
            ...modifiedInput,
            displayName: new RegExp(criteria.displayName, 'i')
        }
    }
    if (criteria.fullName) {
        modifiedInput = {
            ...modifiedInput,
            fullName: new RegExp(criteria.fullName, 'i')
        }
    }
    if (criteria.createdAt) {
        modifiedInput = {
            ...modifiedInput,
            createdAt: criteria.createdAt
        }
    }
    return modifiedInput
}


async function modifyMutation(criteria) {
    var modifiedInput = {}
    if (criteria._id) {
        modifiedInput = {
            ...modifiedInput,
            id: criteria._id
        }
    }
    if (criteria.displayName) {
        modifiedInput = {
            ...modifiedInput,
            displayName: new RegExp(criteria.displayName, 'i')
        }
    }
    if (criteria.fullName) {
        modifiedInput = {
            ...modifiedInput,
            fullName: new RegExp(criteria.fullName, 'i')
        }
    }
    if (criteria.createdAt) {
        modifiedInput = {
            ...modifiedInput,
            createdAt: criteria.createdAt
        }
    }
    if (criteria.role) {
        modifiedInput = {
            ...modifiedInput,
            role: criteria.role
        }
    }
    if (criteria.password) {
        modifiedInput = {
            ...modifiedInput,
            password: await User.generatePassword(criteria.password)
        }
    }
    return modifiedInput
}


export const Query = {
    async currentUser(_, {
        token
    }) {
        var parseUser = await ensure_token(token)
        var data = await User.findById(parseUser._id).populate('posts').lean()
        return data
    },
    async user(_,{
        _id
    }) {
        return  await User.findById(_id).populate('posts').lean()
    },
    async users(_, {
        criteria,
        skip,
        limit
    }) {
        return await User
            .find({
                ...modifyCriteria(criteria)
            }).populate('posts')
            .skip(skip)
            .limit(limit)
            .lean()
    }
}


export const Mutation = {
    async registerUser(_, {
        userInput
    }) {
        userInput._id = new mongoose.Types.ObjectId().toString()
        userInput.createdAt = new Date().getTime()
        userInput.posts = []
        userInput.role = "MEMBER"
        let modifiedInput = await modifyMutation(userInput)
        let newUser = await User.create({
            ...modifiedInput
        })
        return User.generateToken(newUser._id, newUser.role).toString()
    },
    async login(_, {
        userInput
    }) {
        return await User.login({
            ...userInput
        })
    },
    async updateUser(_, {
        userInput
    }) {
        var parseUser = await ensure_token(userInput.token)
        userInput.createdAt = false
        userInput.username = false
        userInput.posts = false
        userInput.role = false
        await User.findByIdAndUpdate(parseUser._id, {
            $set: {
                ...modifyMutation(userInput)
            }
        }, {
            new: true
        })
        return await User.findById(parseUser._id).populate('posts').lean()
    }
}