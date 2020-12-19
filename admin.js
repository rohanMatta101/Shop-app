const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { check }=require('express-validator');
const adminController = require('./Controllers/Admin.js');
const isauth=require('./Middleware/isAuth');



const routes = express.Router();
routes.use(bodyParser.urlencoded({extended:false}));

routes.get('/add-product',isauth,adminController.getaddproduct);
routes.get('/XX',isauth,adminController.getProducts)
routes.post('/add-product',
check('title')
.isString()
.isLength({min:3}).trim(),
check('price').isDecimal().withMessage('abcd').isLength({min:2}).withMessage('Not a valid price'),
check('description').isLength({min:5,max:200})
,isauth,adminController.postaddproduct);


routes.post('/edit-product',check('title')
.isString()
.isLength({min:3}).trim(),
check('price').isLength({min:2}).withMessage('Not a valid price'),
check('description').isLength({min:5,max:200}),isauth,adminController.posteditproduct);

routes.get('/edit-product/:PRODUCTID',isauth,adminController.geteditproduct);
routes.post('/delete-product',isauth,adminController.deleteprod);

exports.routes=routes;
