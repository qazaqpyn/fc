const { body, validationResult } = require('express-validator');
const message = require('../models/message');
let  Message = require('../models/message');
let User = require('../models/user');
const async =require('async');

//display list of all messages 
exports.message_list = function(req, res, next) {
    Message.find()
        .populate('user')
        .exec((err, list_messages) => {
            if (err) {return next(err);}

            //succesful render
            res.render('message_list', {title: 'Message List', message_list: list_messages});
        })
};

//display details of message
exports.message_detail = function(req,res,next) {
    Message.findById(req.params.id)
        .populate('user')
        .exec(function(err, message_detail) {
            if(err) {return next(err);}

            if(message_detail==null) {
                //there are no result
                let err = new Error('Message not found');
                err.status = 404;
                return next(err);
            }

            res.render('message_detail', {title:message_detail.title, message: message_detail});
        })
};

//display message create 
exports.message_create_get = function(req, res, next) {
    console.log(req.app.locals.userCurrent.id);
    User.findOne({"username":req.app.locals.userCurrent.username})
        .exec(function(err,result) {
            if(err) {return next(err);}

            if(result.statusMember) {
                res.render('message_form', {title:'Write Message', user: result});
            } else {
                res.redirect('/');
            }
        })
};

//handle create
exports.message_create_post = [
    body('title', 'Title must not be empty').trim().isLength({min:1}).escape(),
    body('text', 'Text area must not be empty').trim().isLength({min:1}).escape(),

    (req,res,next) => {
        const errors = validationResult(req);
        let message = new Message({
            title: req.body.title,
            user: req.app.locals.userCurrent.id,
            text: req.body.text
        });
        if(!errors.isEmpty()) {
            //there are errors 
            res.render('message_form', {title: 'Write message', user: req.app.locals.userCurrent, errors: errors.array()});
            return;
        } else {
            message.save(function (err) {
                if(err) {return next(err);}
                //successful 
                res.redirect("/catalog"+message.url);
            });
        }
    }
];


exports.message_delete_get = function(req,res) {
    res.redirect('/')
};

exports.message_delete_post = (req,res,next) => {
    async.parallel({
        user: function(callback) {
            User.findById(req.app.locals.userCurrent.id).exec(callback);
        },
        message: function(callback) {
            Message.findById(req.params.id).exec(callback);
        }
    }, function(err,results) {
        //error
        if(err) {return next(err);}

        if(!results.user.isAdmin) {
            res.redirect('/catalog'+results.message.url);
        } else {
            Message.findByIdAndRemove(req.params.id, function deleteMessage(err) {
                if(err) {return next(err);}

                //success
                res.redirect('/catalog/messages');
            })
        }

    })
}