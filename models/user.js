let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        first_name: {type: String, required: true, maxLength: 100},
        last_name: {type: String, required: true, maxLength: 100},
        username: {type: String, required: true, maxLength: 100},
        password: {type:String, required: true},
        statusMember: {type: Boolean, default: false},
        messages: [{type: Schema.Types.ObjectId, ref: 'Message'}]
    }
);

//virtual for user url
UserSchema
    .virtual('url')
    .get(function(){
        return '/user/' + this._id;
    });

//exports model
module.exports = mongoose.model('User', UserSchema);