const Event=require('../../models/events');
const User=require('../../models/users');

const {transformEvent} =require('./merge');


module.exports={
    events:()=>{
        return Event.find().then((events)=>{
            return events.map(event=>{
                return transformEvent(event);
            })
        }).catch(err=>{
            console.log(err);
            throw err;
        });
    },
    createEvent:(args,req)=>{
       if(!req.isAuth){
           throw new Error("Unauthentiated");
       }
        const event=new Event({
            title:args.eventInput.title,
            description:args.eventInput.description,
            price:+args.eventInput.price,
            date:new Date(args.eventInput.date),
            creator:req.userId,

        });
        let createdevent;
        return event.save().then((result)=>{
            createdevent=transformEvent(result);
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

}