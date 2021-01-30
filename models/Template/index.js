const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const TemplateSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    typeOfTemplate: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

TemplateSchema.plugin(timestamp);

const Template = mongoose.model("template", TemplateSchema);
module.exports = Template;
