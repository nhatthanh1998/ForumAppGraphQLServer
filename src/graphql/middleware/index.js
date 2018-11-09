import User from '../../models/User'
import 'babel-polyfill'
export async function ensure_token(token) {
    if (token) {
        var parseUser = await User.parseToken(token)
        if (parseUser.error) {
            return null
        } else {
            return parseUser
        }
    } else {
        return null
    }
}