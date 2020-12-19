const fs=require('fs');
const path=require('path');
const Order=require('../Models/order');
const Product = require('../Models/data.js');
const { error } = require('console');
const PDFdoc=require('pdfkit');
const ITEMS_PER_PAGE=2;
exports.getproductsinshop=(req,res,next)=>{
    const page=+req.query.page||1;

    let totalitems;
    // findAll is a defined function which will give back the elements present in our database
    Product.find().countDocuments()
    .then(numproducts=>{
        totalitems=numproducts;
        return Product.find()
        .skip((page-1)*ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products=>{
        res.render('SHOP/Product-list',{prods:products, 
            pagetitle:'PRODUCTS-LIST',
            currentpage:page,
            hasNextPage:page*ITEMS_PER_PAGE<totalitems,
            hasPreviousPage:page>1,
            nextPage:page+1,
            previousPage:page-1,
            lastPage:Math.ceil(totalitems/ITEMS_PER_PAGE)
        });
    })
     .catch(err=>{
        console.log('shopprodlist');
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(error);
     });
}

exports.getsingleproduct = (req,res,next)=>{
    const prodid = req.params.productid;
    Product.findById(prodid)
    .then(product=>{
        res.render('SHOP/Productdetail',{product:product,pagetitle:'DETAILS'});
    }).catch(err=>{
        console.log('shopproddetail');
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(error);    
    });
}
exports.getIndex=(req,res,next)=>{
    const page=+req.query.page||1;

    let totalitems;
    // findAll is a defined function which will give back the elements present in our database
    Product.find().countDocuments()
    .then(numproducts=>{
        totalitems=numproducts;
        return Product.find()
        .skip((page-1)*ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products=>{
        res.render('SHOP/index',{prods:products, 
            pagetitle:'INDEX-PAGE',
            currentpage:page,
            hasNextPage:page*ITEMS_PER_PAGE<totalitems,
            hasPreviousPage:page>1,
            nextPage:page+1,
            previousPage:page-1,
            lastPage:Math.ceil(totalitems/ITEMS_PER_PAGE)
        });
    }).catch(err=>{
        console.log('index');
        const error=new Error(err);
       error.httpStatusCode=500;
       return next(error);
    });
}
/*
exports.getCart=(req,res,next)=>{
    console.log('in get cart');
   req.user.populate('cart.items.productid').execPopulate()
   .then(user=>{
       console.log('in ge cart2');
     const myproducts=user.cart.items;
     res.render('SHOP/cart',{
         pagetitle:'MY CART',
         product:myproducts
     })
   })
   .catch(err=>{
    console.log('in error');
    const error=new Error(err);
       error.httpStatusCode=500;
       return next(error);
   });
}
*/
exports.getCart = (req, res, next) => {
    
    req.user.populate('cart.items.productid').execPopulate()
    .then(user => {
         
         
        const data=user.cart.items;
        res.render('SHOP/cart',{pagetitle:'MY CART',products:data});

    })
    .catch(err => {
        console.log('getcart');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
};
exports.postCart=(req,res,next)=>{
    const prodid = req.body.productId;
    console.log(prodid);
     Product.findById(prodid)
     .then(product=>{
         console.log(product);
         return req.user.addToCart(product)
     })
     .then(result=>{
         console.log('got product');
         console.log(result);
         res.redirect('/cart');
     })
     .catch(err=>{
        console.log('postcart');
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(error);
     });
};   

/* let fetchedCart;
    let newQuantity=1;
    req.user[0].getCart().then(cart=>{
        fetchedCart=cart;
        return cart.getProducts({where:{id:prodid}});
    })
    .then(products=>{
        let product;
        if(products.length>0)
        {
            product=products[0];
        }
        if (product)
        { 
            const oldQuantity=product.cartItem.quantity;
            newQuantity=oldQuantity+1;
            return product;
          
        }
        return Product.findAll({where:{id:prodid}}).then(product=>{
            return fetchedCart.addProduct(product,{
                through:{quantity:newQuantity}
            });
    
        })
        .then(product=>{
            return fetchedCart.addProduct(product,{
                through:{quantity:newQuantity}
            });

    })
    .then(()=>{
       res.redirect('/cart');
    })
    .catch(err=>console.log(err));

exports.getCheckout=(req,res,next)=>{
    res.render('SHOP/checkout',{
      pagetitle:'CHECKOUT'
    });
}*/
/*exports.getCheckout=(req,res,next)=>{
    let products;
    let total=0;
    console.log('aagaya');
    req.user.populate('cart.items.productid').execPopulate()
   .then(user=>{
      products=user.cart.items;
      total=0;
     products.forEach(p=>{
         total=total + p.quantity*p.productid.price;
     });
     return stripe.checkout.sessions.create({
         payment_method_type:['card'],
         line_items:products.map(p=>{
             return {
                 name:p.productid.title,
                 description:p.productid.description,
                 amount:p.productid.price*100,
                 currency:'usd',
                 quantity:p.quantity

             }
         }),
         success_url:req.protocol + '://' + req.get('host') + '/checkout/success',
         cancel_url:req.protocol + '://' + req.get('host') + '/checkout/cancel'
     })
     
   })
   .then(session=>{
    return res.render('SHOP/checkout',{
        pagetitle:'CHECKOUT',
        product:products,
        totalsum:total,
        sessionId:session.id
    });

   })
   .catch(err=>{
    const error=new Error(err);
       error.httpStatusCode=500;
       return next(error);
   })
}*/
exports.postOrder=(req,res,next)=>{
    req.user.populate('cart.items.productid').execPopulate()
   .then(user=>{
     const products=user.cart.items.map(i=>{
         return {quantity:i.quantity,product:{...i.productid._doc}}
    });
    const order=new Order({
        user:{
            email:req.user.email,
            userId:req.session.user
        },
        products:products

      });
    return order.save();
   })
    .then(result=>{
        return req.user.clearCart();
    })
    .then(()=>{
        res.redirect('/order');
    })
    .catch(err=>{
        console.log('postorder');
        const error=new Error(err);
       error.httpStatusCode=500;
       return next(error);
    });
}

exports.getOrder=(req,res,next)=>{
    Order.find({"user.userId":req.user._id}).then(orders=>{
        res.render('SHOP/order',{
            pagetitle:'YOUR ORDERS',
            order:orders
        });
    })
    .catch(err=>{
        console.log('getorder');
        const error=new Error(err);
       error.httpStatusCode=500;
       return next(error);
    })
}
exports.deleteCartItem=(req,res,next)=>{
    const getid = req.body.productId;
    req.user.removeFromCart(getid)
    .then(result=>{
        res.redirect('/cart');
    })
    .catch(err=>{
        console.log('deletecartitem');
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(error);
    })
}
exports.getInvoice=(req,res,next)=>{
    const invoiceId=req.params.orderId;
    Order.findById(invoiceId)
    .then(order=>{
        if(!order)
        {
            return next(new Error('No order found'));
        }
        if(order.user.userId.toString()!==req.user._id.toString())
        {
            return next( new Error('UNAUTHORIZED'))
        }
        const invoiceName='invoice-' + invoiceId + '.pdf';
        const invoicePath=path.join('DATA','Invoices',invoiceName);
        const pdfdoc=new PDFdoc();
        pdfdoc.pipe(fs.createWriteStream(invoicePath));
        pdfdoc.pipe(res);
        let totalPrice=0;
        res.setHeader('Content-type','application/pdf');
        res.setHeader('Content-disposition','attachment; filename="'+invoiceName+'"');
        pdfdoc.fontSize(26).text('INVOICE');
        
        order.products.forEach(prod=>{
             totalPrice = totalPrice + prod.product.price*prod.quantity
            pdfdoc.text('1.' + prod.product.title );
            pdfdoc.text('2.'+ prod.product.price);
            pdfdoc.text('3.'+ prod.product.description);
        });
        pdfdoc.text('Total Price :' + totalPrice );
        pdfdoc.end();

    })
    .catch(err=>{
        console.log('invoiceget');
        return next(err);
    })

}