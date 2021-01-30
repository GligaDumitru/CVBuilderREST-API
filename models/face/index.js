const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const FaceSchema = new Schema({
    userId:{
        type:String
    },
    label:{
        type:String
    },
    descriptors:{
        type:[]
    },
    backup:{
        type:[]
    }
});

FaceSchema.plugin(timestamp);

const FaceDescriptors = mongoose.model("face", FaceSchema);
module.exports = FaceDescriptors;
