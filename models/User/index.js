const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  accountActivated: {
    type: Boolean,
    default: false,
  },
  tempPassword: {
    type: Object,
    default: {
      pass: "",
      exp: new Date(),
      isActive: false,
    },
  },
  isSuprem: {
    type: Boolean,
    default: false
  },
  templates: {
    type: [],
    default: []
  },
  businessCardTemplates: {
    type: [],
    default: []
  },
  coverLetterTemplates: {
    type: [],
    default: []
  },
  methods: {
    type: [],
  },
  accountType: {
    type: String,
    default: 'email-password'
  },
  faceLogin: {
    type: Boolean,
    default: false
  },
  faceDetails: {
    type: [],
    default: []
  }
});

UserSchema.plugin(timestamp);

const User = mongoose.model("users", UserSchema);
module.exports = User;
