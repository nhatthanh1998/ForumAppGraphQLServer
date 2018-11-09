import express from 'express'
import {
    PORT
} from './config/config'
import schema from './graphql'
import http from 'http'
import {
    ApolloServer
} from 'apollo-server-express'
import {
    mongoose
} from './database/mongoose'
const app = express();

const server = new ApolloServer({
    schema
})
server.applyMiddleware({app})
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer)
httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
  })