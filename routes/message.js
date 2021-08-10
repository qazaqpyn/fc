let express = require('express');
let router = express.Router();


//require controller modules
let message_controller = require('../controllers/messageController');
let user_controller = require('../controllers/userController');
let auth_controller = require('../controllers/authController');
const message = require('../models/message');


//message routers

//get create message
router.get('/message/create',message_controller.message_create_get);

//post create message
router.post('/message/create', message_controller.message_create_post);
//get list of all messages
router.get('/messages', message_controller.message_list);

//get detail of message
router.get('/message/:id',message_controller.message_detail);



//get delete message
router.get('/message/:id/delete',message_controller.message_delete_get);

//post delete message
router.post('/message/:id/delete', message_controller.message_delete_post);

module.exports = router;