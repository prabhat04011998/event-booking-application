const Event=require('../../models/events');
const User=require('../../models/users');
const {dateToString} =require('../../helpers/date');

//to imporove coderesuability , this following section is repeating itself multiple times 
const transformEvent= event =>{
    return {...event._doc,
        _id:event.id,
        creator:user.bind(this,event._doc.creator),
        date:dateToString(event._doc.date)

    }
}

//code resuability for booking
const transformBooking= booking =>{
    return {...booking._doc,
        _id:booking.id,
        user:user.bind(this,booking._doc.user),
        event:singleEvent.bind(this,booking._doc.event),
        createdAt:dateToString(booking._doc.createdAt),
        updatedAt:dateToString(booking._doc.updatedAt)
    };
}


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
        return transformEvent(event);

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
            return transformEvent(event);
        });
    }).catch(err=>{
        console.log("event finding error ");
        throw err;
    })
}

exports.user=user;
exports.singleEvent=singleEvent;
exports.events=events;

exports.transformBooking=transformBooking;
exports.transformEvent=transformEvent;