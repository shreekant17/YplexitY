const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: [true, "Message text is required"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  attachments: [
    {
      type: String,
      required: false,
    },
  ],
  deleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexing for faster queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
module.exports = Message;
