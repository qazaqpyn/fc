let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let MessageSchema = new Schema(
    {
        title: {type: String, required: true, maxLength:100},
        timestamp: {type: Date, default: Date.now},
        text: {type: String, required: true},
        user: {type: Schema.Types.ObjectId, ref: 'User', required: true}
    }
);

//virtual for message's url
MessageSchema
    .virtual('url')
    .get(function(){
        return '/message/' + this._id;
    });

//export model
module.exports = mongoose.model('Message', MessageSchema);