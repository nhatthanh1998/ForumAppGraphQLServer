import { makeExecutableSchema } from 'graphql-tools'
import { importSchema } from 'graphql-import'
import path from 'path'
import RootResolver from './RootResolver';
import {
    PubSub
} from 'graphql-subscriptions'
export const pubsub = new PubSub()
const typeDefs = importSchema(path.join(__dirname, './TypeDefs.graphql'))

export default makeExecutableSchema({
    resolvers: RootResolver,
    typeDefs: typeDefs
})