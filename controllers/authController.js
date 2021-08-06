let User = require('../models/user');
let bcrypt = require('bcryptjs');
const { body, validationResult} = require('express-validator');
const passport = require('passport');
const user = require('../models/user');

exports.sign_up_get = function(req,res) {
    res.render('sign-up-form',{title:'Sign Up Form'});
}

exports.sign_up_post = [
    // validate and sanitise fields 
    body('first_name', 'First name must be filled').trim().isLength({min:1}).escape(),
    body('last_name','Last name must be filled').trim().isLength({min:1}).escape(),
    body('username','username must be filled').trim().isEmail().escape(),
    body('password', 'password must be fille').trim().isLength({min:1}).escape(),
    body('passwordConfirmation').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    (req,res,next) => {
        //extract the validation errors from a request
        const errors = validationResult(req);

        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if(err) {return next(err);}

            let user = new User(
                {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    username: req.body.username,
                    password: hashedPassword
                }
            );

            User.findOne({'username': user.username})
                .exec((err, foundUser) => {
                    if(err) {return next(err);}

                    //same username is already exists 
                    if(foundUser) {
                        res.render('sign-up-form', {title: 'Sign Up form', problem: "username is taken"});
                        return;
                    }
                    else if(!errors.isEmpty()) {
                        //there are errors. render again same form
                        res.render('sign-up-form', {title: 'Sign Up Form', user: user, errors: errors.array()});
                        return;
                    } else {
                        //data is valid. lets save everything
                        user.save(function(err) {
                            if(err) {return next(err);}
                            //successful - render some new page
                            res.redirect('/sign-in');
                        });
                    }
                })
    
        })

    }
];

exports.sign_in_get = function(req,res) {
    res.render('sign-in-form',{title:'Sign In'})
}

exports.sign_in_post = passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect: '/sign-in'
})

exports.log_out_get = function(req,res) {
    req.logout();
    res.redirect('/');
}

exports.join_club_post = function(req,res, next) {
    if(req.body.passcode==='ALA') {
        User.findOne({"username": req.body.username})
            .exec((err, foundUser)=>{
                if(err) {return next(err);}
                console.log('you found it'+ foundUser._id)
                let updatedUser = new User({
                    _id: foundUser._id,
                    first_name: foundUser.first_name,
                    last_name: foundUser.last_name,
                    username: foundUser.username,
                    password: foundUser.password,
                    statusMember: true,
                    messages: foundUser.messages
                });

                User.findByIdAndUpdate(foundUser._id, updatedUser, {}, function(err, theuser) {
                    if (err) {return next(err);}

                    console.log('updated');

                    res.redirect('/');
                })
            })
    }
}