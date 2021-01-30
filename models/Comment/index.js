const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const CommentSchema = new Schema({
    comments:{
        type:[],
        required:false
    }
});

CommentSchema.plugin(timestamp);

const Comment = mongoose.model("comment", CommentSchema);
module.exports = Comment;
