const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const AnonimTemplateSchema = new Schema({
    templateType: {
        type: String,
        required: true
    },
    templateID: {
        type: String,
        required: true,
        unique: true
    },
    currentTemplate: {
        type: {},
        default: {}
    }
})

AnonimTemplateSchema.plugin(timestamp);

const AnonimTemplate = mongoose.model("anonimTemplate", AnonimTemplateSchema);
module.exports = AnonimTemplate;
