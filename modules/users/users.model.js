const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    username: { type: String },
    fullname: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    role: { type: String },
    created_at: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);