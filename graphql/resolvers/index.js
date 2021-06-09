const Event=require('../../models/events');
const Booking=require('../../models/bookings');
const User=require('../../models/users');
const bcrypt=require('bcryptjs');




//function to populate the data of creator user in the event's creator field
const user=(userId)=>{
    return User.findById(userId).then(user=>{
        return {...user._doc,_id:user.id,
            createdEvents:events.bind(this,user.createdEvents),
        };
    }).catch(err=>{
        console.log(err);
        throw err;
    });
}

//to populate the data of single event in the bookings wala schema
const singleEvent=async (eventId)=>{
    try
    {
        const event=await Event.findById(eventId);
        return {...event._doc,
            _id:event.id,
            creator:user.bind(this,event.creator),

        };

    }
    catch(err){
        throw err;
    }
    
}


//funaction to populate the data of all the events created by user , becuase our createdEvents currently taking the array of id, 
//while we want to push the complete events
const events=(eventIds)=>{
    return Event.find({_id:{$in :eventIds}}).then(events=>{
        return events.map(event=>{
            return {...event._doc,
                creator:user.bind(this,event.creator),
                date:new Date(event._doc.date).toISOString()
            };
        });
    }).catch(err=>{
        console.log("event finding error ");
        throw err;
    })
}


module.exports={
    events:()=>{
        return Event.find().then((events)=>{
            return events.map(event=>{
                return {...event._doc,
                    _id:event.id,
                    creator:user.bind(this,event._doc.creator),
                    date:new Date(event._doc.date).toISOString()

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
            createdevent={...result._doc,_id:result.id,
                creator:user.bind(this,result._doc.creator),
                date:new Date(event._doc.date).toISOString()

            };
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
        

    },
    bookings:async ()=>{
        try{
            const bookings=await Booking.find();
            return bookings.map(booking=>{
                return {...booking._doc,
                    _id:booking.id,
                    user:user.bind(this,booking._doc.user),
                    event:singleEvent.bind(this,booking._doc.event),
                    createdAt:new Date(booking._doc.createdAt).toISOString(),
                    updatedAt:new Date(booking._doc.updatedAt).toISOString()
                }
            })
        }
        catch(err){
            throw err;

        }

    },
    bookEvent:async (args)=>{
        try
        {
            const fetchedEvent=await Event.findOne({_id:args.eventId});
            const booking=new Booking({
                user:'60c08882ea9e19d773ab5d9f',
                event:fetchedEvent,
            });
            const result=await booking.save();
            return {...result._doc,
                _id:result.id,
                user:user.bind(this,result._doc.user),
                event:singleEvent.bind(this,result._doc.event),
                createdAt:new Date(result._doc.createdAt).toISOString(),
                updatedAt:new Date(result._doc.updatedAt).toISOString(),
            };
            

        }
        catch(err)
        {
            throw err;
        }
    },
    cancelBooking:async (args)=>{
        try{
            const booking=await Booking.findById(args.bookingId).populate('event');
            const event={
                ...booking.event._doc,
                _id:booking.event.id,
                creator:user.bind(this,booking.event._doc.creator),
            }
            await Booking.deleteOne( {_id:args.bookingId});
            return event; 


        }catch(err){
            throw err;
        }
        

    }

}