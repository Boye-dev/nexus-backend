const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");
const Patient = require("../models/Patient");
const User = require("../models/User");
const {
  sendBookEmail,
  sendApproveEmail,
  sendDeclineEmail,
  sendCancelEmail,
  sendRescheduleEmail,
} = require("../services/appointmentService");
const { DateTime } = require("luxon");

module.exports.book_appointment = async (req, res) => {
  try {
    const { specialty, additionalInformation, patientId, title } = req.body;

    // Find doctors with the requested specialty
    const doctors = await Doctor.find({ specialty, verified: true });

    if (doctors.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "No available doctors for the requested specialty",
      });
    }

    const doctorIds = doctors.map((doctor) => doctor._id);

    // Find the upcoming appointments count for each doctor (including pending and scheduled appointments)
    const appointmentCounts = await Appointment.aggregate([
      {
        $match: {
          doctorId: { $in: doctorIds },
          status: { $in: ["PENDING", "SCHEDULED"] },
        },
      },
      {
        $group: {
          _id: "$doctorId",
          count: {
            $sum: {
              $cond: [{ $eq: ["$status", "SCHEDULED"] }, 10, 1],
            },
          },
        },
      },
    ]);
    // Sort doctors based on the appointment count
    doctors.sort((doctor1, doctor2) => {
      const doctor1Id = doctor1._id.toString();
      const doctor2Id = doctor2._id.toString();
      const count1 =
        appointmentCounts.find((count) => count._id.toString() === doctor1Id)
          ?.count || 0;
      const count2 =
        appointmentCounts.find((count) => count._id.toString() === doctor2Id)
          ?.count || 0;
      return count1 - count2;
    });

    // Create a new appointment using the doctor with the least number of upcoming appointments
    const appointment = new Appointment({
      specialty,
      patientId,
      title,
      doctorId: doctors[0]._id,
      additionalInformation,
      status: "PENDING",
    });

    // Save the appointment
    const savedAppointment = await appointment.save();
    const patient = await Patient.findById(patientId);
    const foundPatient = await User.findOne({ userId: patientId });
    console.log(doctors[0]._id);
    const foundDoctor = await User.findOne({ userId: doctors[0]._id });
    console.log(foundPatient, foundDoctor);

    const newNotification = new Notification({
      type: "Appointment",
      title: "Appointment Booked",
      content: `An appointment was booked by ${patient.lastName} ${patient.firstName}`,
      userStatus: [
        { userId: foundPatient._id, status: "unread" },
        { userId: foundDoctor._id, status: "unread" },
      ],
    });

    const createdNotification = await newNotification.save();
    await sendBookEmail(patientId, doctors[0]._id, savedAppointment, res);
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

module.exports.approve_appointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { doctorId, endDateTime, startDateTime } = req.body;

    // Find the appointment by its ID
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "Failed to book appointment" });
    }

    // Check if the provided doctorId matches the assigned doctorId of the appointment
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({
        status: "ERROR",
        message:
          "Unauthorized. Only the assigned doctor can approve this appointment.",
      });
    }

    // Update the appointment with the doctor's datetime and change the status to 'SCHEDULED'
    // Convert UTC dates to West Africa Time (WAT)
    appointment.startDateTime = new Date(startDateTime);
    appointment.endDateTime = new Date(endDateTime);
    appointment.status = "SCHEDULED";

    const updatedAppointment = await appointment.save();
    const foundPatient = await User.findOne({ userId: appointment.patientId });
    const foundDoctor = await User.findOne({ userId: doctorId });

    try {
      // Check if a chat already exists with the same user IDs
      const existingChat = await Chat.findOne({
        users: { $all: [foundDoctor._id, foundPatient._id] },
      });

      if (existingChat) {
        // A chat already exists, no need to create a new one
        console.log("Chat already exists:", existingChat);
      } else {
        console.log("creating chat");
        // Create a new chat
        var charData = {
          chatName: "sender",
          isGroupChat: false,
          users: [foundDoctor._id, foundPatient._id],
          unreadMessages: [
            {
              userId: foundDoctor._id,
              unread: 0,
            },
            {
              userId: foundPatient._id,
              unread: 0,
            },
          ],
        };
        const createdChat = await Chat.create(charData);
      }
      const doctor = await Doctor.findById(doctorId);

      const newNotification = new Notification({
        type: "Appointment",
        title: "Appointment approved",
        content: `An appointment was approved by ${doctor.lastName} ${doctor.firstName}`,
        userStatus: [{ userId: foundPatient._id, status: "unread" }],
      });

      // Save the updated appointment
      const createdNotification = await newNotification.save();
      await sendApproveEmail(doctorId, updatedAppointment, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "ERROR",
        message: "Something Went Wrong While Creating Chat",
      });
    }
  } catch (error) {
    console.error("Error approving appointment:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to approve appointment",
      error: error.message,
    });
  }
};

module.exports.cancel_appointment = async (req, res) => {
  try {
    const { appointmentId, userId } = req.params;

    // Find the appointment by its ID
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "Failed to cancel appointment" });
    }

    appointment.status = "CANCELLED";

    // Save the updated appointment
    const updatedAppointment = await appointment.save();
    const foundUser = await User.findOne({ userId }).populate({
      path: "userDetails",
      model: "User",
      select: "firstName lastName email profilePicture",
    });
    const foundPatient = await User.findOne({
      userId: appointment.patientId,
    });
    const foundDoctor = await User.findOne({ userId: appointment.doctorId });

    const newNotification = new Notification({
      type: "Appointment",
      title: "Appointment cancelled",
      content: `An appointment was cancelled by ${foundUser.userDetails.lastName} ${foundUser.userDetails.firstName}`,
      userStatus: [
        { userId: foundPatient._id, status: "unread" },
        { userId: foundDoctor._id, status: "unread" },
      ],
    });

    const createdNotification = await newNotification.save();
    await sendCancelEmail(updatedAppointment, res);
  } catch (error) {
    console.error("Error in cancelling appointment", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to cancel  appointment",
      error: error.message,
    });
  }
};

module.exports.reschedule_appointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { doctorId, endDateTime, startDateTime } = req.body;

    // Find the appointment by its ID
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "Failed to reschedule appointment" });
    }

    // Check if the provided doctorId matches the assigned doctorId of the appointment
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({
        status: "ERROR",
        message:
          "Unauthorized. Only the assigned doctor can reschedule this appointment.",
      });
    }

    // Update the appointment with the doctor's datetime and change the status to 'SCHEDULED'
    appointment.startDateTime = new Date(startDateTime);
    appointment.endDateTime = new Date(endDateTime);
    appointment.status = "SCHEDULED";

    // Save the updated appointment
    const updatedAppointment = await appointment.save();
    const doctor = await Doctor.findById(appointment.doctorId);
    const foundPatient = await User.findOne({
      userId: appointment.patientId,
    });
    const foundDoctor = await User.findOne({ userId: appointment.doctorId });

    const newNotification = new Notification({
      type: "Appointment",
      title: "Appointment rescheduled",
      content: `An appointment was rescheduled by ${doctor.lastName} ${doctor.firstName} `,
      userStatus: [
        { userId: foundPatient._id, status: "unread" },
        { userId: foundDoctor._id, status: "unread" },
      ],
    });

    const createdNotification = await newNotification.save();

    await sendRescheduleEmail(updatedAppointment, res);
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to reschedule appointment",
      error: error.message,
    });
  }
};

module.exports.decline_appointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find the appointment by its ID
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "Appointment not found" });
    }

    // Add the current doctor to the doctor history
    appointment.doctorHistory.push(appointment.doctorId);

    // Find doctors with the same specialty, excluding the declined appointment's doctor and doctors from doctorHistory
    const doctors = await Doctor.find({
      specialty: appointment.specialty,
      _id: { $nin: [...appointment.doctorHistory, appointment.doctorId] },
    });

    if (doctors.length > 0) {
      const doctorIds = doctors.map((doctor) => doctor._id);

      // Find the upcoming appointments count for each doctor (including pending and scheduled appointments)

      const appointmentCounts = await Appointment.aggregate([
        {
          $match: {
            doctorId: { $in: doctorIds },
            status: { $in: ["PENDING", "SCHEDULED"] },
          },
        },
        {
          $group: {
            _id: "$doctorId",
            count: {
              $sum: {
                $cond: [{ $eq: ["$status", "SCHEDULED"] }, 10, 1],
              },
            },
          },
        },
      ]);
      // Sort doctors based on the appointment count
      doctors.sort((doctor1, doctor2) => {
        const doctor1Id = doctor1._id.toString();
        const doctor2Id = doctor2._id.toString();
        const count1 =
          appointmentCounts.find((count) => count._id.toString() === doctor1Id)
            ?.count || 0;
        const count2 =
          appointmentCounts.find((count) => count._id.toString() === doctor2Id)
            ?.count || 0;
        return count1 - count2;
      });

      // Reassign the appointment to the doctor with the least number of upcoming appointments
      appointment.doctorId = doctors[0]._id;
      appointment.status = "PENDING";

      // Save the updated appointment
      await appointment.save();

      console.log("Appointment declined and reassigned successfully");
      res.status(200).json({
        status: "OK",
        message: "Appointment declined and reassigned successfully",
        data: appointment,
      });
    } else {
      // No available doctors to assign, update the appointment status to 'Declined'
      const doctorId = appointment.doctorId;
      appointment.doctorId = null;
      appointment.status = "DECLINED";
      const updatedAppointment = await appointment.save();

      const doctor = await Doctor.findById(doctorId);
      const foundPatient = await User.findOne({
        userId: appointment.patientId,
      });
      const foundDoctor = await User.findOne({ userId: doctorId });

      const newNotification = new Notification({
        type: "Appointment",
        title: "Appointment declined",
        content: `Your appointment ${updatedAppointment.title} was declined please book it again`,
        userStatus: [{ userId: foundPatient._id, status: "unread" }],
      });

      // Save the updated appointment
      const createdNotification = await newNotification.save();
      await sendDeclineEmail(appointment, res);
    }
  } catch (error) {
    console.error("Error declining appointment:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to decline appointment",
      error: error.message,
    });
  }
};

module.exports.get_all = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page, limit, status } = req.query;

    // Prepare the filter object
    const filter = { patientId };
    if (status) {
      filter.status = status;
    }

    // Fetch the total count of appointments
    const totalCount = await Appointment.countDocuments(filter);

    // Apply pagination
    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(filter)
      .sort({ startDateTime: 1 }) // Sort by datetime in ascending order
      .skip(skip)
      .limit(limit)
      .populate("doctorId", "firstName lastName specialty");
    // Remove doctorHistory field from each appointment object
    const appointmentsWithoutDoctorHistory = appointments.map((appointment) => {
      const { doctorHistory, ...appointmentWithoutHistory } =
        appointment.toObject();
      return appointmentWithoutHistory;
    });
    res.status(200).json({
      status: "OK",
      message: "Appointments retrieved successfully",
      data: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        appointments: appointmentsWithoutDoctorHistory,
      },
    });
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve appointments",
      error: error.message,
    });
  }
};
module.exports.get_all_info = async (req, res) => {
  try {
    const { patientId } = req.params;
    const currentDateTime = new Date();

    // Get the total number of appointments
    const totalAppointments = await Appointment.countDocuments({ patientId });

    // Get the number of upcoming appointments (Scheduled appointments with datetime > currentDateTime)
    const upcomingAppointments = await Appointment.countDocuments({
      patientId,
      status: "SCHEDULED",
      startDateTime: { $gt: currentDateTime },
    });

    // Get the number of declined appointments
    const declinedAppointments = await Appointment.countDocuments({
      patientId,
      status: "DECLINED",
    });

    // Get the number of cancelled appointments
    const cancelledAppointments = await Appointment.countDocuments({
      patientId,
      status: "CANCELLED",
    });

    res.status(200).json({
      status: "OK",
      message: "Appointment information retrieved successfully",
      data: {
        totalAppointments,
        upcomingAppointments,
        declinedAppointments,
        cancelledAppointments,
      },
    });
  } catch (error) {
    console.error("Error retrieving appointment information:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve appointment information",
      error: error.message,
    });
  }
};

module.exports.get_upcoming = async (req, res) => {
  try {
    const { patientId } = req.params;
    const currentDateTime = new Date();

    // Find all upcoming appointments for the patient with datetime greater than or equal to currentDateTime
    const upcomingAppointments = await Appointment.find({
      patientId,
      status: "SCHEDULED",
      startDateTime: { $gte: currentDateTime },
    }).populate("doctorId", "firstName lastName profilePicture");
    const appointmentsWithoutDoctorHistory = upcomingAppointments.map(
      (appointment) => {
        const { doctorHistory, ...appointmentWithoutHistory } =
          appointment.toObject();
        return appointmentWithoutHistory;
      }
    );
    res.status(200).json({
      status: "OK",
      message: "Upcoming appointments retrieved successfully",
      data: appointmentsWithoutDoctorHistory,
    });
  } catch (error) {
    console.error("Error retrieving upcoming appointments:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve upcoming appointments",
      error: error.message,
    });
  }
};

// DOCTORS APPOINTMENT
module.exports.get_upcoming_doctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const currentDateTime = new Date();

    // Find all upcoming appointments for the doctor with datetime greater than or equal to currentDateTime
    const upcomingAppointments = await Appointment.find({
      doctorId,
      status: "SCHEDULED",
      startDateTime: { $gte: currentDateTime },
    }).populate("patientId", "firstName lastName profilePicture");

    const appointmentsWithoutDoctorHistory = upcomingAppointments.map(
      (appointment) => {
        const { doctorHistory, ...appointmentWithoutHistory } =
          appointment.toObject();
        return appointmentWithoutHistory;
      }
    );
    res.status(200).json({
      status: "OK",
      message: "Upcoming appointments retrieved successfully",
      data: appointmentsWithoutDoctorHistory,
    });
  } catch (error) {
    console.error("Error retrieving upcoming appointments:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve upcoming appointments",
      error: error.message,
    });
  }
};

module.exports.get_all_info_doctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const currentDateTime = new Date();

    // Get the total number of appointments
    const totalAppointments = await Appointment.countDocuments({ doctorId });

    // Get the number of upcoming appointments (Scheduled appointments with datetime > currentDateTime)
    const upcomingAppointments = await Appointment.countDocuments({
      doctorId,
      status: "SCHEDULED",
      startDateTime: { $gt: currentDateTime },
    });

    // Get the number of declined appointments
    const declinedAppointments = await Appointment.countDocuments({
      doctorId,
      status: "DECLINED",
    });

    // Get the number of cancelled appointments
    const cancelledAppointments = await Appointment.countDocuments({
      doctorId,
      status: "CANCELLED",
    });

    res.status(200).json({
      status: "OK",
      message: "Appointment information retrieved successfully",
      data: {
        totalAppointments,
        upcomingAppointments,
        declinedAppointments,
        cancelledAppointments,
      },
    });
  } catch (error) {
    console.error("Error retrieving appointment information:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve appointment information",
      error: error.message,
    });
  }
};

module.exports.get_all_doctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page, limit, status } = req.query;

    // Prepare the filter object
    const filter = { doctorId };
    if (status) {
      filter.status = status;
    }

    // Fetch the total count of appointments
    const totalCount = await Appointment.countDocuments(filter);

    // Apply pagination
    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(filter)
      .sort({ datetime: 1 }) // Sort by datetime in ascending order
      .skip(skip)
      .limit(limit)
      .populate("patientId", "firstName lastName");
    // Remove doctorHistory field from each appointment object
    const appointmentsWithoutDoctorHistory = appointments.map((appointment) => {
      const { doctorHistory, ...appointmentWithoutHistory } =
        appointment.toObject();
      return appointmentWithoutHistory;
    });
    res.status(200).json({
      status: "OK",
      message: "Appointments retrieved successfully",
      data: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        appointments: appointmentsWithoutDoctorHistory,
      },
    });
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve appointments",
      error: error.message,
    });
  }
};

module.exports.get_history_doctor = async (req, res) => {
  const doctorId = req.params.doctorId;
  const currentDate = new Date();
  try {
    const pastAppointments = await Appointment.find({
      doctorId,
      $or: [
        { status: { $ne: "PENDING" } },
        {
          $and: [
            { status: "SCHEDULED" },
            { startDateTime: { $lte: currentDate } },
          ],
        },
        { status: "CANCELLED" },
      ],
    })
      .populate("patientId", "firstName lastName profilePicture")
      .populate("doctorId", "firstName lastName profilePicture")
      .exec();
    const filteredAppointments = pastAppointments.filter(
      (appointment) =>
        appointment.status !== "SCHEDULED" ||
        appointment.startDateTime <= currentDate
    );

    res.json({
      status: "OK",
      message: "History Retrieved Successfully",
      data: filteredAppointments,
    });
  } catch (error) {
    console.error("Error retrieving past appointments:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve past appointments",
      error: error.message,
    });
  }
};

module.exports.get_history_patient = async (req, res) => {
  const patientId = req.params.patientId;
  const currentDate = new Date();
  try {
    const pastAppointments = await Appointment.find({
      patientId,
      $or: [
        { status: { $ne: "PENDING" } },
        {
          $and: [
            { status: "SCHEDULED" },
            { startDateTime: { $lte: currentDate } },
          ],
        },
        { status: "CANCELLED" },
      ],
    })
      .populate("patientId", "firstName lastName profilePicture")
      .populate("doctorId", "firstName lastName profilePicture")
      .exec();
    const filteredAppointments = pastAppointments.filter(
      (appointment) =>
        appointment.status !== "SCHEDULED" ||
        appointment.startDateTime <= currentDate
    );
    res.json({
      status: "OK",
      message: "History Retrieved Successfully",
      data: filteredAppointments,
    });
  } catch (error) {
    console.error("Error retrieving past appointments:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve past appointments",
      error: error.message,
    });
  }
};
