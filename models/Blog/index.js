const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const BlogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'offline'
    },
    subtitle: {
        type: String,
        required: false,
    },
    mainImage: {
        type: String,
        required: false
    },
    post: {
        type: {},
        required: true
    },
    author: {
        type: {},
        required: true
    },
    tags: {
        type: [],
        required: false
    },
    commentId: {
        type: String,
        default: 'NoIDAvailable'
    }
});

BlogSchema.plugin(timestamp);

const Blog = mongoose.model("blog", BlogSchema);
module.exports = Blog;
