const User=require('../Models/User');
const crypto=require('crypto');
const nodemailer=require('nodemailer');
const mytransport = require('nodemailer-sendgrid-transport');
const { validationResult }=require('express-validator');
const bcryptjs=require('bcryptjs');
const transporter=nodemailer.createTransport(mytransport({
    auth:{
        api_key:'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'
    }
}));
exports.getLogin=(req,res,next)=>{
    let message=req.flash('error');
    if(message.length>0)
    {
        message=message[0];
    }
    else{
        message=null;
    }
    console.log(req.session.isLoggedIn);
    //const isLogged=req.get('Cookie').split('=')[1]==='true';
    res.render('auth/Login',{
        pagetitle:'MY LOGIN',
        isAuthenticated:false,
        errorMessage:message,
        earlyInput:{
            email:"",
            password:''
        },
        invaliderr:[]

    });
}
exports.postLogin=(req,res,next)=>{
    //req.session.isLoggedIn=true;
    const email=req.body.email;
    const password=req.body.password;
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
       return  res.status(422).render('auth/Login',{
            pagetitle:'MY LOGIN',
            isAuthenticated:false,
            errorMessage:errors.array()[0].msg,
            earlyInput:{
                email:email,
                password:password
            },
            invaliderr:errors.array()
        });
    }
    User.findOne({email:email})
    .then(user=>{
        if(!user)
        {
            req.flash('error','This email does not exist');
            return res.redirect('/login');
        }

        return bcryptjs.compare(password,user.password)
        .then(doMatch=>{
            if(doMatch)
            {
                req.session.isLoggedIn=true;
                req.session.user=user;
                return req.session.save((err)=>{
                     console.log(err);
                     return res.redirect('/');
                });
            }
            res.redirect('/login');
        })
        .catch(err=>{
            console.log(err);
        });

    })
    .catch(err=>{
        console.log(err);
    })

}
exports.getSignup=(req,res,next)=>{
    let message=req.flash('unavailable');
    if(message.length>0)
    {
        message=message[0];
    }
    else{
        message=null;
    }
    return res.render('auth/signup',{
        pagetitle:'SIGN-UP',
        isAuthenticated:false,
        invalid:message,
        oldInput:{
            email:"",
            password:'',
            confirmpassword:''
        },
        validationErrors:[]
    })
}
exports.postSignup=(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        console.log(errors.array());
        return res.status(422).render('auth/signup',{
            pagetitle:'SIGN-UP',
            isAuthenticated:false,
            invalid:errors.array()[0].msg,
            oldInput:{
                email:email,
                password:password,
                confirmpassword:req.body.confirmpassword
            },
            validationErrors:errors.array()
        })
    }
    
         bcryptjs.hash(password,12).then(hashedPassword=>{
            const user = new User({
                email:email,
                password:hashedPassword,
                cart:{items:[]}
            });
            return user.save();
    
        })
        .then(result=>{
            res.redirect('/login');
            return transporter.sendMail({
                to:email,
                from:'awesomeraunakbhagat@gmail.com',
                subject:'signed up',
                html:'<h1>YO BITCH </h1>'
            });
        })
        .catch(err=>{
            console.log(err);
        });
    
}

exports.postLogout=(req,res,next)=>{
    req.session.destroy((err)=>{
        console.log(err);
        res.redirect('/');
    })
}

exports.getReset=(req,res,next)=>{
    let message=req.flash('error');
    if(message.length>0)
    {
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('auth/reset',{
        pagetitle:'password reset',
        errorMessage:message
    });
}

exports.postReset=(req,res,next)=>{
    const myuser=req.body.email;
  console.log(myuser);
    crypto.randomBytes(12,(err,buffer)=>{
        if(err){
            console.log(err);
             res.redirect('/reset');
        }
        const token=buffer.toString('hex');
        User.findOne({email:myuser})
        .then(user=>{
            console.log('yaha');
            console.log(user);
          if(!user)
          {
              req.flash('error','No account found');
             res.redirect('/reset');
          }
          user.resetToken=token;
          user.resetTokenExpire=Date.now() + 3600000;
          return user.save();
        })
        .then(result=>{
            res.redirect('/');
            transporter.sendMail({
                to:req.body.email,
                from:'awesomeraunakbhagat@gmail.com',
                subject:'password reset',
                html:`
                   <p> you requested for password reset</p>
                   <p> Click on this link <a href="http://localhost:3000/reset/${token}">link</a>to set a new password</p>
                `
            });

        })
        .catch(err=>{
            console.log(err);
        })
    });
}

exports.getnewPassword=(req,res,next)=>{
    const token=req.params.token;
    User.findOne({resetToken:token,resetTokenExpire:{$gt:Date.now()}})
    .then(user=>{
        let message=req.flash('error');
        if(message.length>0)
        {
          message=message[0];
        }
        else{
        message=null;
        }
        res.render('auth/new-password',{
            pagetitle:'NEW-PASSWORD',
            errorMessage:message,
            userId:user._id.toString(),
            passwordToken:token

        })
    })
    .catch(err=>{
        console.log(err);
    })
}
exports.postnewPassword=(req,res,next)=>{
    const newpassword=req.body.password;
    const userId=req.body.userid;
    const Token=req.body.Token;

    let resetUser;
    User.findOne({resetToken:Token,resetTokenExpire:{$gt:Date.now()},_id:userId})
    .then(user=>{
        resetUser=user;
        return bcryptjs.hash(newpassword,12)
    
    })
    .then(hashedpassword=>{
        resetUser.password=hashedpassword;
        resetUser.resetToken=undefined;
        resetUser.resetTokenExpire=undefined;
        return resetUser.save();
    })
    .then(result=>{
        res.redirect('/login');
    })
    .catch(err=>{
        console.log(err);
    })

}