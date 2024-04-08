const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const patientVerificationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  uniqueString: { type: String },
  email: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

patientVerificationSchema.index({ patientId: 1 }, { unique: true });

const PatientVerification = mongoose.model(
  "PatientVerification",
  patientVerificationSchema
);

module.exports = PatientVerification;
