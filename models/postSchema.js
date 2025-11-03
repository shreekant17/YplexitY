const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
    trim: true,
    maxlength: 10000, // Limit post content length
  },

  media: {
    type: String, // URLs to media files (images, videos)
  },
  public_id: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing User model for who liked the post
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Referencing User model for the commenter
      },
      text: {
        type: String,
        required: true,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  shares: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing User model for who shared the post
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp for post creation
  },
  updatedAt: {
    type: Date, // Timestamp for post updates
  },
  visibility: {
    type: String,
    enum: ["public", "friends", "private"], // Privacy settings
    default: "public",
  },
  isEdited: {
    type: Boolean,
    default: false, // Indicates if the post was edited
  },
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
module.exports = Post;
