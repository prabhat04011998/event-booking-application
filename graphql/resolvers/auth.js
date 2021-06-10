const User=require('../../models/users');
const bcrypt=require('bcryptjs');
const {events} =require('./merge');

module.exports={
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

}