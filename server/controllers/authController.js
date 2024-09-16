const User = require('../models/user')
const{hashpassword,comparePassword} = require('../helpers/auth')
const jwt = require ('jsonwebtoken');

const test = (req,res)=>{
    res.json('test is working')
    
}
//register endpoint

 const registerUser =async (req,res) =>{
    try{
        const{name,email,password} = req.body;
        /// check if name was entered
        if(!name){
            return res.json({
                error:'name is required'
            })
        };
        //check if password is good
        if(!password||password.length<6){
            return res.json({
                error:'password is required and should be at least 6 charecters long'
            })
        };
        //check email
        const exist = await  User.findOne({email});
        if(exist){
            return res.json({
                error:'Email is taken already'
            })
        }
        const hashedpassword = await hashpassword(password);

        // create user in database
        const user = await User.create({
            name,email,password:hashedpassword
        });
        return res.json(user)

    }catch(error){
        console.log(error)

    }

 };
 //login endpoint
const loginUser =async (req,res) =>{
    try{
        const{email,password} = req.body;
        //check if user exist
        const user = await User.findOne({email});
        if(!user){
            return res.json({
                error:'no user found'
            })
        }
        //check password
        const match = await comparePassword(password,user.password)
        if(match) {
            jwt.sign({email:user.email,id:user._id,name: user.name},process.env.JWT_SECRET,{},(err,token)=>{

                if(err) throw err;
                res.cookie('token',token).json(user)
            })
        }
        if(!match){
            res.json('Passwords do not match')
        }

    }catch(error){
        console.log(error)

    }
};
const getProfile = (req,res)=>{
    const{token} = req.cookies
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,{},(err,user)=>{
             if(err) throw err;
             res.json(user)
        })
    }else{
        res.json(null)
    }

}
 



module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile
}