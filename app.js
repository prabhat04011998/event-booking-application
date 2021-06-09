const express=require('express');
const bodyParser=require('body-parser');
const {graphqlHTTP}=require('express-graphql');
const {buildSchema}= require('graphql');
const bcrypt=require('bcryptjs');

const mongoose=require('mongoose');
const app=express();
const Event=require('./models/events');
const User=require('./models/users');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//function to populate the data of creator user in the event's creator field
const user=(userId)=>{
    return User.findById(userId).then(user=>{
        return {...user._doc,_id:user.id,createdEvents:events.bind(this,user.createdEvents)};
    }).catch(err=>{
        console.log(err);
        throw err;
    });
}
//funaction to populate the data of all the events created by user , becuase our createdEvents currently taking the array of id, 
//while we want to push the complete events
const events=(eventIds)=>{
    return Event.find({_id:{$in :eventIds}}).then(events=>{
        return events.map(event=>{
            return {...event._doc,creator:user.bind(this,event.creator)};
        });
    }).catch(err=>{
        console.log("event finding error ");
        throw err;
    })
}
const Events=[];
app.use('/graphql',graphqlHTTP({
    schema:buildSchema(`
        type Event{
            _id:ID!
            title:String!
            description:String!
            date:String!
            price:Float!
            creator:User!
        }
        type User{
            _id:ID!
            email:String!
            password:String
            createdEvents:[Event!]

        }

        input EventInput{
            title:String!
            description:String!
            date:String!
            price:Float!
        }
        
        input UserInput{
            email:String!
            password:String!
        }


        type RootQuery{
            events:[Event!]!
            users:[User!]!
        }
        type RootMutation{
            createEvent(eventInput:EventInput):Event
            createUser(userInput:UserInput):User
        }
        schema{
            query:RootQuery
            mutation:RootMutation
        }
    `),
    rootValue:{
        events:()=>{
            return Event.find().then((events)=>{
                return events.map(event=>{
                    return {...event._doc,
                        _id:event.id,
                        creator:user.bind(this,event._doc.creator)
                    };
                })
            }).catch(err=>{
                console.log(err);
                throw err;
            });
        },
        createEvent:(args)=>{
           
            const event=new Event({
                title:args.eventInput.title,
                description:args.eventInput.description,
                price:+args.eventInput.price,
                date:new Date(args.eventInput.date),
                creator:'60c08882ea9e19d773ab5d9f',

            });
            let createdevent;
            return event.save().then((result)=>{
                createdevent={...result._doc,_id:result.id,creator:user.bind(this,result._doc.creator)};
                return User.findById('60c08882ea9e19d773ab5d9f')
                

            }).then(user=>{
                if(!user){
                    throw new Error("User not found");
                }
                console.log("pikachu",user);
                user.createdEvents.push(event);
                user.save();
            }).then(result=>{
                console.log(result);
                return createdevent;

            }).catch(err=>{
                console.log(err);
                throw err;
            })
            
        },
        users:()=>{
            return User.find().then(users=>{
                return users.map(user=>{
                    console.log("fisrst check point");
                    return {...user._doc,_id:user.id,
                        createdEvents:events.bind(this,user._doc.createdEvents)};
                })
            }).catch(err=>{
                console.log(err);
                throw err;
            })
        },
        createUser:(args)=>{
            return  User.findOne({email:args.userInput.email}).then((user)=>{
                if(user){
                    throw new Error("User Already Exist");
                }
                return bcrypt.hash(args.userInput.password,12);

            }).then((hashedPassword)=>{
                const user=new User({
                    email:args.userInput.email,
                    password:hashedPassword,
                });
                return user.save()

            }).then(result=>{
                return {...result._doc,_id:result.id,password:null};
            }).catch(err=>{
                console.log("Creating User error ",err);
                throw err;

            })
            

        }

    },
    graphiql:true


}));
mongoose.connect(` mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.rlrxg.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority `).then(()=>{
    app.listen(3000);
    console.log(" Server is listening at port 3000........");

}).catch(err=>{
    console.log(err);
    throw err;
});

