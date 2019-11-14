const mongoose = require('mongoose');
const db = mongoose.connection;
const env = require('dotenv').config();
const replySchema = require('./reply.js')

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err, db) => {
    if (err) {
        console.log(err)
        console.log('db not connected')
    } else {
        console.log('connected')
    }
})

const msgsSchema = mongoose.Schema;

const msgSchema = new msgsSchema({
    name: String,
    text: String,
    delete_password: String,
    created_on: Date,
    bumped_on: Date,
    reported: { type: Boolean, default: false },
    replies: [replySchema]
})
const msg = mongoose.model('msg', msgSchema)


module.exports = msg;
