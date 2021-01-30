const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const QuestionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: 'offline'
    }

});

QuestionSchema.plugin(timestamp);

const Question = mongoose.model("question", QuestionSchema);
module.exports = Question;
