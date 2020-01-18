const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    username: { type: String },
    fullname: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    gender: { type: String },
    address: { type: String },
    gym_class : {
        title : { type:String },
        type : { type:String },
        trainer_name : { type:String },
        time_type : { type:String },
        start_time : { type:String },
        end_time : { type:String },
    },
    isTaken : { type:String },
    isActive : { type:String },
    role: { type: String },
    created_at: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);