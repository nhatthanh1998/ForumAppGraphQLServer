import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import 'babel-polyfill'
import bcrypt from 'bcryptjs'
import {
    SECRECT
} from '../config/config'
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 5
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    displayName: {
        type: String
    },
    fullName: {
        type: String
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }],
    createdAt: {
        type: Number
    },
    role: {
        type: String
    },
    token: {
        type: String
    }
})

UserSchema.statics.generateToken = function (_id, role) {
    var token = jwt.sign({
        _id,
        role
    }, SECRECT, {
        expiresIn: '1y'
    })
    return token
}

UserSchema.statics.login = async function ({
    username,
    password
}) {
    var user = await User.findOne({
        username: username
    })
    if (user) {
        var check = bcrypt.compareSync(password, user.password)
        if (check === true) {
            return jwt.sign({
                _id: user._id,
                role: user.role
            }, SECRECT, {
                expiresIn: '1d'
            })
        } else {
            return "Username or password is wrong"
        }
    } else {
        return "Account not created yet!"
    }
}
UserSchema.statics.parseToken = async function (token) {
    try {
        var decoded = await jwt.verify(token, SECRECT)
        return decoded
    } catch (err) {
        return {
            "error": "Invalid token"
        }
    }
}

UserSchema.statics.generatePassword = async function (password) {
    let salt = await bcrypt.genSalt(10)
    var newPassword = await bcrypt.hash(password, salt)
    return newPassword
}


const User = mongoose.model('user', UserSchema)
export default User