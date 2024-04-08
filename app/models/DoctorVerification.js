const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const doctorVerificationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  uniqueString: { type: String },
  email: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

doctorVerificationSchema.index({ doctorId: 1 }, { unique: true });

const DoctorVerification = mongoose.model(
  "DoctorVerification",
  doctorVerificationSchema
);

module.exports = DoctorVerification;
