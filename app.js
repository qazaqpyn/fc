var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let bcrypt = require('bcryptjs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var messageRouter = require('./routes/message');


var app = express();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let User = require('./models/user');


//setup database
let mongoose = require('mongoose');
let mongoDB = "mongodb+srv://alimkali:alimkali77@rolex0.v3xoc.mongodb.net/fight-club?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection; 
db.on('error', console.log.bind(console, "MongoDB connection problem:"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({username:username}, (err, user) => {
      if(err) {
        return done(err);
      }
      if(!user) {
        return done(null, false, {message: 'Incorrect username'});
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) {
          //passwords match
          return done(null, user)
        } else {
          //passwords do not match
          return done(null, false, {message:'Incorrect password'});
        }
      });
    });
  })
);

passport.serializeUser(function(user,done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(session({secret:'cats', resave:false, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//middleware to use currentUser
app.use(function(req,res,next) {
  app.locals.userCurrent = req.user;
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', messageRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
