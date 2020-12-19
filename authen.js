const express=require('express');
const authController=require('./Controllers/authenticate');
const { check,body }=require('express-validator');
const routes=express.Router();
const User=require('./Models/User');
routes.get('/login',authController.getLogin);
routes.post('/login',check('email')
.isEmail()
.withMessage('Invalid Email').normalizeEmail(),
check('password')
.isLength({min:5})
.withMessage('Password should have atleast 5 characters').isAlphanumeric().trim(),authController.postLogin);
routes.post('/logout',authController.postLogout);
routes.get('/signup',authController.getSignup);
routes.post('/signup',check('email').isEmail().withMessage('Please enter a valid email').normalizeEmail().custom((value,{req})=>{
    return User.findOne({email:value})
    .then(userDOC=>{
        if(userDOC)
        {
            return Promise.reject('Email already exists pick a different one');
        }
    })
})    
,check('password').isLength({min:5}).trim().withMessage('password should have at least 5 letters').isAlphanumeric(),
check('confirmpassword').trim().custom((value,{req})=>{
    if(value!==req.body.password)
    {
        throw new Error('Passwords do not match');
    }
    else{
        return true;
    }
}),authController.postSignup);
routes.get('/reset',authController.getReset);
routes.post('/reset',authController.postReset);
routes.get('/reset/:token',authController.getnewPassword);
routes.post('/new-password',authController.postnewPassword);
module.exports=routes;