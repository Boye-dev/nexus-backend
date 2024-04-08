const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "role", // Reference the field to determine the referenced model dynamically
  },
  role: {
    type: String,
    enum: ["Doctor", "Patient"], // Enumerate the possible roles (schemas)
    required: true,
  },
});

// Define virtual population for the userId field
UserSchema.virtual("userDetails", {
  refPath: "role",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Apply the virtual population when the user data is requested
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", UserSchema);

module.exports = User;
