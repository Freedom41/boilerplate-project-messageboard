const mongoose = require('mongoose');
const db = mongoose.connection;
const env = require('dotenv').config();

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err, db) => {
    if (err) {
        console.log(err)
        console.log('db not connected')
    } else {
        console.log('connected')
    }
})

const msgsSchema = mongoose.Schema;

const replySchema = new msgsSchema({
    text: String,
    created_on: Date,
    delete_password: String,
    reported: { type: Boolean, default: false },
})

module.exports = replySchema;