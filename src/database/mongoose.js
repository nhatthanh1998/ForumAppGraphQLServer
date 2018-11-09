import mongoose from 'mongoose'
import { MONGOURI } from '../config/config'
mongoose.Promise = global.Promise

mongoose.connect(MONGOURI, { useNewUrlParser: true })
module.exports = {
    mongoose
}