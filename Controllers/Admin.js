const Product = require('../Models/data.js');
const mongodb=require('mongodb');
const { validationResult }=require('express-validator');
const mongoose=require('mongoose');
const fileHelper=require('../Util/filedelete');

const objectid=mongodb.ObjectId;

exports.getaddproduct=(req,res,next)=>{
  
    console.log('i am in');
    res.render('ADMIN/edit-product',{
        pagetitle:'ADD-PRODUCT',
        editing:false,
        hasError:false,
        errorMessage:null,
        invaliderr:[]
    });
}

exports.postaddproduct=(req,res,next)=>{
    const title = req.body.title;
    const image = req.file;
    const desc = req.body.description;
    const price = req.body.price; 
    const errors=validationResult(req);
    if(!image)
    {
        return res.status(422).render('ADMIN/edit-product',{
            pagetitle:'ADD-PRODUCT',
            editing:false,
            hasError:true,
            product:{
                title:title,
                imageUrl:image,
                price:price,
                description:desc
            },
            errorMessage:'Attatched file is not an image',
            invaliderr:errors.array()
        });   
    }
    //const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(422).render('ADMIN/edit-product',{
            pagetitle:'ADD-PRODUCT',
            editing:false,
            hasError:true,
            product:{
                title:title,
                imageUrl:image,
                price:price,
                description:desc
            },
            errorMessage:errors.array()[0].msg,
            invaliderr:errors.array()
        });   
    }
    const imageURL=image.path;
    const data=new Product({
        title:title,
        price:price,
        description:desc,
        imageUrl:imageURL,
        userId:req.user
    })
    data.save().then(result=>{
       console.log('created products');
       res.redirect('/products');
   })
   .catch(err=>{
       console.log('postaddprod');
       const error=new Error(err);
       error.httpStatusCode=500;
       return next(error);
   });
    
}
exports.geteditproduct=(req,res,next)=>{
    const editMode = req.query.edit;
    if(!editMode)
    {
        return res.redirect('/');
    }
    const prodId=req.params.PRODUCTID;
    Product.findById(prodId)
    .then(myprod => {
            
            if(!myprod)
            {
             return res.redirect('/');
            }
            res.render('ADMIN/edit-product',{
            pagetitle:'EDIT-PRODUCT',
            editing:editMode,
            hasError:false,
            product:myprod,
            invaliderr:[],
            errorMessage:[]
            });   
        })
    .catch(err=>{
        console.log('geteditprod');
        const error=new Error(err);
    error.httpStatusCode=500;
    return next(error);
    });
};
exports.posteditproduct=(req,res,next)=>{
    const prodid = req.body.myid;
    const updatedtitle=req.body.title;
    const image=req.file;
    const updatedprice=req.body.price;
    const updateddesc=req.body.description;
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(422).render('ADMIN/edit-product',{
            pagetitle:'EDIT-PRODUCT',
            editing:true,
            hasError:true,
            product:{
                title:updatedtitle,
                price:updatedprice,
                description:updateddesc,
                _id:prodid
            },
            errorMessage:errors.array()[0].msg,
            invaliderr:errors.array()
        });   
    }
    Product.findById(prodid).then(product=>{
        if(product.userId.toString()!==req.user._id.toString())
        {
            return res.redirect('/');
        }
        product.title=updatedtitle;
        product.price=updatedprice;
        product.description=updateddesc;
        if(image)
        {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl=image.path;
        }
        //product.imageUrl=updatedimageU;
        return product.save().then(result=>{
            console.log('UPDATED-PRODUCTS');
            res.redirect('/XX');
        })
    })
    .catch(err=>{
        console.log('posteditprod');
        const error=new Error(err);
       error.httpStatusCode=500;
       return next(error);
    })
}

exports.getProducts=(req,res,next)=>{
    Product.find({userId:req.user._id})
    .select('title price')
    .then(product=>{
        console.log(product);
        res.render('ADMIN/Products for ADMIN',{
            prods:product,
           pagetitle:'ADMIN-PRODUCTS'

        });
    }).catch(err=>{
        console.log('adminprod');
        const error=new Error(err);
    error.httpStatusCode=500;
    return next(error);
    });
}
exports.deleteprod=(req,res,next)=>{
    const dataid=req.body.prid;
    Product.findById(dataid).then(product=>{
        if(!product)
        {
            return next(new Error('Product not found'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id:dataid,userId:req.user._id});
    })
    .then(()=>{
        //res.status(200).json({message:'success'});
        res.redirect('/XX');
    })
    
    .catch(err=>{
        console.log('deleteprod');
        const error=new Error(err);
       error.httpStatusCode=500;
       return next(error);
       //res.status(500).json({message:'failed'});
    })
}