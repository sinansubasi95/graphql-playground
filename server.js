const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');

const app = express();

// graphqlHTTP is middleware
// graphiql is development tool that allows us to make queries against our development server so only intented to be use in development envrionment
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('Listening');
});