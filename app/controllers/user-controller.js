const User = require('../models/user-model')
const {registerValidationSchema, loginValidationSchema} = require('../validators/user-validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {};

userController.register = async (req, res) => {
    const body = req.body;
    const {error, value} = registerValidationSchema.validate(body, {abortEarly : false});
    if(error){
        return res.status(400).json({error: error.details.map(err => err.message)});
    }
    try{
        const userPresentWithEmail = await User.findOne({email: value.email})
        if(userPresentWithEmail){
            return res.status(400).json({error : 'email already taken'});
        }else{
            const user = new User(value);
            const salt = await bcryptjs.genSalt();
            const hashPassword = await bcryptjs.hash(value.password, salt);
            user.password = hashPassword;

            const usersCount = await User.countDocument();
            if(usersCount == 0){
                user.role = 'admin'
            }
            await user.save();
            res.status(201).json(user)
        }
    } catch(err){
        console.log(err);
        res.status(500).json({error: "something went wrong"})
    }
}

userController.login = async (req, res) => {
    const body = req.body;
    const {error, value} = userLoginValidationSchema.validate(body, {abortEarly: false});
    if(error){
        res.status(400).json({error: error.details.map(err => err.message)});
    }
    const userPresent = await User.findOne({email : value.email});
    if(!userPresent){
        return res.status(400).json({error : 'invalid email'});
    }

    const isPasswordMatch = await bcryptjs.compaere(value.password, userPresent.password)
    if(!isPasswordMatch){
        return res.status(400).json({error: "invalid password"});
    }

    const tokenData = {userId: userPresent._id, role: userPresent.role};
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {expiresIn: '7d'});
    res.json({token})
}
