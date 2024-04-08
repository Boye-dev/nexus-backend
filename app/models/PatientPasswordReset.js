const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const patientPasswordResetSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  resetString: { type: String },
  email: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

patientPasswordResetSchema.index({ patientId: 1 }, { unique: true });

const PatientPasswordReset = mongoose.model(
  "PatientPasswordReset",
  patientPasswordResetSchema
);

module.exports = PatientPasswordReset;
