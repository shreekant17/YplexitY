const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    trim: true,
  },
  lname: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true, // Ensures that the username is unique
    default: Date.now().toString(),
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  terms: {
    type: Boolean,
    required: true,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
