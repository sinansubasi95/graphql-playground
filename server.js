const express = require('express');
const { graphqlHTTP } = require('express-graphql');

const app = express();

// graphiql is development tool that allows us to make queries against our development server so only intented to be use in development envrionment
app.use('/graphql', graphqlHTTP({
    graphiql: true
}));

app.listen(4000, () => {
    console.log('Listening');
});