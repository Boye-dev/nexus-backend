const mongoose = require("mongoose");
const subscribersSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

const Subscribers = mongoose.model(
  "Subscribers",
  subscribersSchema
);

module.exports = Subscribers;
