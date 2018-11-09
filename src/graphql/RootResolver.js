import Scalar from './scalar/resolver'
import {
    Query as PostQuery,
    Mutation as PostMutation,
    Subscription as PostSubscription
} from './posts/resolver'
import {
    Query as UserQuery,
    Mutation as UserMutation,

} from './users/resolver'
import {
    Query as CommentQuery,
    Mutation as CommentMutation,
    Subscription as CommentSubscription
} from './comments/resolver'
export default {
    ...Scalar,
    Query: {
        ...PostQuery,
        ...UserQuery,
        ...CommentQuery
    },
    Mutation: {
        ...PostMutation,
        ...UserMutation,
        ...CommentMutation
    },
    Subscription: {
        ...PostSubscription,
        ...CommentSubscription
    },

    // TYPE 
    UserType:{
        _id: root => root._id,
        username: root => root.username,
        
    }
}