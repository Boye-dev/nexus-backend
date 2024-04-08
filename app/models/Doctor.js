const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const doctorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    phoneNumber: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    specialty: { type: String, required: true },
    gender: { type: String, required: true },
    profilePicture: { type: String, required: true },
    profilePicturePublicCloudinaryId: { type: String, required: true },
    verified: { type: Boolean, default: false },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "DOCTOR" },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
