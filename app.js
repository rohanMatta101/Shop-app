const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const multer=require('multer');
const flash = require('connect-flash');
const fileStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'images');

  },
  filename:(req,file,cb)=>{
    cb(null,file.filename + '-' + file.originalname);
  }
});

const errorController = require('./Controllers/error');
const User = require('./Models/User');

const MONGODB_URI =
  'mongodb+srv://ROHANMATTA:gujjarisking@rohan123-qhbh0.mongodb.net/test?retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

const filter=(req,file,cb)=>{
  if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg')
  {
    cb(null,true);
  }
  else{
    cb(null,false);
  }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const admin = require('./admin');
const shop = require('./shop');
const authen = require('./authen');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest:'images',storage:fileStorage,fileFilter:filter}).single('imageUrl'));
app.use(express.static(path.join(__dirname, 'CSS')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use(admin.routes);
app.use(shop);
app.use(authen);

app.get('/500', errorController.get500);

app.use(errorController.geterrorpage);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', 
  {
    pagetitle: 'Error!',
    isAuthenticated: req.session.isLoggedIn
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });