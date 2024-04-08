// Import the mongoose module
const mongoose = require("mongoose");

const { Schema } = mongoose;

const ChatSchema = new Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the Doctor model
      },
    ],

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    unreadMessages: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User", // Reference to the Doctor model
        },
        unread: {
          type: Number,
          default: 0,
        },
      },
    ],
  },

  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
