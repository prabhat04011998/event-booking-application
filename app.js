const express=require('express');
const bodyParser=require('body-parser');
const {graphqlHTTP}=require('express-graphql');
const mongoose=require('mongoose');

const graphQlSchema=require('./graphql/schema/index');
const graqhQlResolvers=require('./graphql/resolvers/index');

const app=express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//graphql endpoint hitting
app.use('/graphql',graphqlHTTP({
    schema:graphQlSchema,
    rootValue:graqhQlResolvers,
    graphiql:true
}));

//mongoose Database Connection

mongoose.connect(` mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.rlrxg.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority `).then(()=>{
    app.listen(3000);
    console.log(" Server is listening at port 3000........");

}).catch(err=>{
    console.log(err);
    throw err;
});

