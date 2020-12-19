const express = require('express');
const path=require('path');
const shopcontroller =require('./Controllers/Shop.js');
const isauth=require('./Middleware/isAuth');

const routes2 = express.Router();

routes2.get('/',shopcontroller.getIndex);
routes2.get('/products',shopcontroller.getproductsinshop)

routes2.get('/products/:productid',shopcontroller.getsingleproduct);
//routes2.get('/checkout/success',shopcontroller.getCheckout);
//routes2.get('/checkout/cancel',shopcontroller.postOrder);
routes2.post('/create-order',isauth,shopcontroller.postOrder);
routes2.get('/order',isauth,shopcontroller.getOrder)
routes2.get('/cart',isauth,shopcontroller.getCart);
routes2.post('/cart',isauth,shopcontroller.postCart);
//routes2.get('/checkout',isauth,shopcontroller.getCheckout);
routes2.post('/cart-delete-item',isauth,shopcontroller.deleteCartItem);
routes2.get('/order/:orderId',shopcontroller.getInvoice);

module.exports=routes2;