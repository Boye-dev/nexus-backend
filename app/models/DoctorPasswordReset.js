const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const doctorPasswordResetSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  resetString: { type: String },
  email: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

doctorPasswordResetSchema.index({ doctorId: 1 }, { unique: true });

const DoctorPasswordReset = mongoose.model(
  "DoctorPasswordReset",
  doctorPasswordResetSchema
);

module.exports = DoctorPasswordReset;
