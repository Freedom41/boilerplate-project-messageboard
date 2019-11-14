"use strict";
var mongoose = require('mongoose');
var msgs = require("../controllers/msgs.js");
var replySchema = require("../controllers/reply.js");

var reply = mongoose.model('reply', replySchema)

module.exports = function (app) {

  app.route("/api/threads/:board")
    .get(async (req, res) => {

      let board = req.params.board;

      let newThread = await msgs.find({ name: board }, async (err, docs) => {
        if (err) {
          console.log(err)
          return res.send('thread not saved')
        }
        if (docs == null) {
          return res.json('Board not found, Please enter correct name')
        } else {
          let sorted = docs.sort((a, b) => {
            return b.bumped_on - a.bumped_on
          })

          sorted.forEach((e) => {
            let temp = e.replies.reverse();
            e.replies = temp.slice(0, 3);
            e.reported = undefined;
            e.delete_password = undefined;
          })
          res.json(sorted)
        }
      })
    })

    .post(async (req, res) => {

      let board = req.params.board;
      let text = req.body.text;
      let password = req.body.delete_password;

      let msg = new msgs({
        name: board,
        text: text,
        delete_password: password,
        created_on: new Date(),
        bumped_on: new Date()
      });

      let newThread = await msgs.findOne({ name: board }, async (err, doc) => {
        if (err) {
          console.log(err)
          res.send('Thread not saved')
        } else {
          await msg.save(err, docs => {
            if (err) {
              console.log(err)
              res.send('Thread msg not saved')
            } else {
              return res.json("saved")
            }
          })
        }
      })
    })

    .put(async (req, res) => {
      let report = req.body;
      let id = mongoose.Types.ObjectId(report.thread_id);
      let board = req.params.board;

      let reports = await msgs.findOneAndUpdate({ name: board }, { reported: true }, async (err, docs) => {
        if (docs == null) {
          return res.json("Document not found")
        } else {
          return res.json("reported")
        }
      })
    })

    .delete(async (req, res) => {

      let id = mongoose.Types.ObjectId(req.body.thread_id);
      let password = req.body.delete_password;
      let board = req.params.board;

      let deleteReq = await msgs.findOne({ name: board }, async (err, docs) => {
        if (err) console.log(err)
        if (docs == null) {
          return res.json('document not found')
        } else {

          if (docs.delete_password !== password) {
            return res.json('incorrect password')
          } else {

            let delReq = await msgs.findByIdAndDelete(id, (err, docs) => {
              if (err) console.log(err)
              res.json('success')
            })
          }
        }
      })
    });

  app
    .route("/api/replies/:board")


    .get(async (req, res) => {
      let id;
      if (req.query.thread_id != 'undefined') {
        id = mongoose.Types.ObjectId(req.query.thread_id);
      }
      let board = req.params.board;

      let replies = await msgs.findOne({ name: board, _id: id }, async (err, docs) => {
        if (err) {
          console.log(err)
          res.json('could not get replies')
        } else {
          if (docs == null) {
            res.json("document not found")
          } else {

            docs.replies.forEach((e) => {
              e.reported = undefined;
              e.delete_password = undefined;
            })

            res.json({
              board: docs.name,
              text: docs.text,
              _id: docs.id,
              created_on: docs.created_on,
              bumped_on: docs.bumped_on,
              replies: docs.replies.reverse()
            })
          }
        }
      })
    })


    .post(async (req, res) => {

      let text = req.body.text;
      let board = req.body.board;
      let id = mongoose.Types.ObjectId(req.body.thread_id);
      let password = req.body.delete_password;

      let date = Date()
      let newReply = await msgs.findByIdAndUpdate(id, { bumped_on: date }, async (err, docs) => {
        if (docs == null) {
          return res.json("Thread not found")
        } else {
          let replyArr = docs.replies;
          let threadReply = new reply({
            'text': text,
            'delete_password': password,
            'created_on': date
          })
          docs.replies.push(threadReply)
          await docs.save((err) => {
            if (err) return res.json('reply not saved')
            console.log('success')
          })
          return res.json(replyArr)
        }
      });
    })

    .put(async (req, res) => {
      let board = req.params;
      let thread_id = mongoose.Types.ObjectId(req.body.thread_id);
      let reply_id = mongoose.Types.ObjectId(req.body.reply_id);

      let delReq = await msgs.findById({ _id: thread_id }, async (err, docs) => {
        if (err) console.log(err)
        let replies = docs.replies.id(reply_id);
        replies.set({ 'reported': true })

        docs.save((err) => {
          if (err) console.log(err)
          return res.json('reported')
        })
      })
    })

    .delete(async (req, res) => {
      let board = req.params;
      let thread_id = mongoose.Types.ObjectId(req.body.thread_id);
      let reply_id = mongoose.Types.ObjectId(req.body.reply_id);
      let password = req.body.delete_password;

      let delReq = await msgs.findById({ _id: thread_id }, async (err, docs) => {
        if (err) console.log(err)
        let replies = docs.replies.id(reply_id);

        if (replies.delete_password == password) {
          replies.set({ text: "[deleted]" })
          docs.save((err) => {
            if (err) console.log(err)
            res.json('success')
          })
        } else {
          return res.json("incorrect password");
        }
      })
    });
};
