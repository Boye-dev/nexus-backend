const Announcement = require("../models/Announcements");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");



module.exports.getAnnouncementsForPatient = async (req, res) => {
    try {
      const { patientId } = req.params;
  
      // Find announcements with patientId
      const announcements = await Announcement.find({
        'patientStatus.patientId': patientId,
      });
  
      res.status(200).json({
        status: 'OK',
        message: 'Announcements retrieved successfully',
        data: announcements,
      });
    } catch (error) {
      console.error('Error retrieving announcements:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to retrieve announcements',
        error: error.message,
      });
    }
};
module.exports.getAnnouncementsForDoctor = async (req, res) => {
    try {
      const { doctorId } = req.params;
  
      // Find announcements with doctorId
      const announcements = await Announcement.find({
        'doctorStatus.doctorId': doctorId,
      });
  
      res.status(200).json({
        status: 'OK',
        message: 'Announcements retrieved successfully',
        data: announcements,
      });
    } catch (error) {
      console.error('Error retrieving announcements:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to retrieve announcements',
        error: error.message,
      });
    }
};

module.exports.updateStatusToReadPatient = async (req, res) => {
  try {
    // const {  } = req.params;
    const { patientId, announcementId } = req.params;

    // Find the announcement by its ID
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      // If the announcement with the given ID doesn't exist
      return res.status(404).json({
        status: 'ERROR',
        message: 'Announcement not found',
      });
    }

    // Find the index of the patientStatus object with the matching patientId
    const patientIndex = announcement.patientStatus.findIndex(
      (patient) => patient.patientId.toString() === patientId
    );

    if (patientIndex === -1) {
      // If the patientId is not found in the patientStatus array
      return res.status(404).json({
        status: 'ERROR',
        message: 'Patient not found for this announcement',
      });
    }

    // Update the status for the specific patient
    announcement.patientStatus[patientIndex].status = 'read';

    // Save the updated announcement
    await announcement.save();

    res.status(200).json({
      status: 'OK',
      message: 'Announcement status updated to "read" for the patient',
      data: announcement,
    });
  } catch (error) {
    console.error('Error updating announcement status:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update announcement status',
      error: error.message,
    });
  }
};

module.exports.updateStatusToReadDoctor = async (req, res) => {
  try {
    // const {  } = req.params;
    const { doctorId, announcementId } = req.params;

    // Find the announcement by its ID
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      // If the announcement with the given ID doesn't exist
      return res.status(404).json({
        status: 'ERROR',
        message: 'Announcement not found',
      });
    }

    // Find the index of the doctorStatus object with the matching doctorId
    const doctorIndex = announcement.doctorStatus.findIndex(
      (doctor) => doctor.doctorId.toString() === doctorId
    );

    if (doctorIndex === -1) {
      // If the doctorId is not found in the doctorStatus array
      return res.status(404).json({
        status: 'ERROR',
        message: 'Doctor not found for this announcement',
      });
    }

    // Update the status for the specific doctor
    announcement.doctorStatus[doctorIndex].status = 'read';

    // Save the updated announcement
    await announcement.save();

    res.status(200).json({
      status: 'OK',
      message: 'Announcement status updated to "read" for the doctor',
      data: announcement,
    });
  } catch (error) {
    console.error('Error updating announcement status:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update announcement status',
      error: error.message,
    });
  }
};

module.exports.createAnnouncement = async (req, res) => {
    try {
      const { name, title, text, date } = req.body;
  
      // Create a new announcement object
      const newAnnouncement = new Announcement({
        name,
        title,
        text,
        timestamp: new Date(),
      });
  
      // Save the new announcement to the database
      const createdAnnouncement = await newAnnouncement.save();
  
      // Get all patients
      const patients = await Patient.find();
      const doctors = await Doctor.find();
  
      // Update patientStatus for each patient in the announcement
      const patientUpdatePromises = patients.map(async (patient) => {
  
        // Update patientStatus in the announcement
        createdAnnouncement.patientStatus.push({
          patientId: patient._id,
          status: 'unread',
        });
      });
  
      // Update doctorStatus for each doctor in the announcement
      const doctorUpdatePromises = doctors.map(async (doctor) => {
  
        // Update doctorStatus in the announcement
        createdAnnouncement.doctorStatus.push({
          doctorId: doctor._id,
          status: 'unread',
        });
      });
  
      // Wait for all updates to complete
      await Promise.all([...patientUpdatePromises, ...doctorUpdatePromises]);
  
      // Save the updated announcement with patientStatus and doctorStatus
      await createdAnnouncement.save();
  
      res.status(201).json({
        status: 'OK',
        message: 'Announcement created successfully',
        data: createdAnnouncement,
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to create announcement',
        error: error.message,
      });
    }
  };
  

module.exports.deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    // Find the announcement by its ID and delete it
    const deletedAnnouncement = await Announcement.findByIdAndDelete(announcementId);

    if (!deletedAnnouncement) {
      // If the announcement with the given ID doesn't exist
      return res.status(404).json({
        status: 'ERROR',
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Announcement deleted successfully',
      data: deletedAnnouncement,
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete announcement',
      error: error.message,
    });
  }
};
