const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    phoneNumber: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    gender: { type: String, required: true },
    emergencyContactName: { type: String, required: true },
    emergencyContactNumber: { type: String, required: true },
    emergencyContactAddress: { type: String, required: true },
    profilePicture: { type: String, required: true },
    profilePicturePublicCloudinaryId: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    relationshipStatus: { type: String, required: true },
    existingMedicalConditions: { type: Array },
    allergies: { type: Array },
    verified: { type: Boolean, default: false },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    announcements: [
      {
        announcement: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Announcement",
          required: true,
        },
        status: {
          type: String,
          default: "unread",
        },
      },
    ],
    role: { type: String, required: true, default: "PATIENT" },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
