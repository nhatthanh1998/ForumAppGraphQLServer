import { GraphQLScalarType } from 'graphql'

export default {
    MongoID: new GraphQLScalarType({
        name: 'MongoID',
        serialize: value => value.toString()
    }),
    Long: new GraphQLScalarType({
        name:'Long',
        serialize:value => value
    })
}