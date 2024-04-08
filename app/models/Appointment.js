const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  specialty: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  additionalInformation: {
    type: String,
  },
  startDateTime: {
    type: Date,
  },
  endDateTime: {
    type: Date,
  },
  status: {
    type: String,
    required: true,
  },
  doctorHistory: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Doctor",
    default: [],
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
