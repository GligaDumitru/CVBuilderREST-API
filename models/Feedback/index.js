const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const FeedbackSchema = new Schema({
    rating: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        default: ''
    },
    opinion: {
        type: String,
        required: true
    },
    typeOfFeedback: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "offline"
    }

});

FeedbackSchema.plugin(timestamp);

const Feedback = mongoose.model("feedback", FeedbackSchema);
module.exports = Feedback;
