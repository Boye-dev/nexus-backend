const { Router } = require("express");
const router = Router();
const appointmentController = require("../controllers/appointmentController");
const notification = require("../controllers/notificationsController");
const { requireAuth, isDoctor } = require("../middlewares/authMiddleware");

//GET REQUESTS
router.get(
  "/appointments/:patientId",
  requireAuth,
  appointmentController.get_all
);
router.get(
  "/notifications/:userId",

  requireAuth,
  notification.getAllNotifications
);

router.put(
  "/notifications/read/:userId/:notificationId",

  requireAuth,
  notification.readNotifications
);
router.put(
  "/notifications/readAll/:userId",
  requireAuth,
  notification.readAllNotifications
);

router.get(
  "/appointments/doctor/:doctorId",
  requireAuth,
  appointmentController.get_all_doctor
);
router.get(
  "/appointments/info/:patientId",
  requireAuth,
  appointmentController.get_all_info
);
router.get(
  "/appointments/info/doctor/:doctorId",
  requireAuth,
  appointmentController.get_all_info_doctor
);
router.get(
  "/appointments/upcoming/:patientId",
  requireAuth,
  appointmentController.get_upcoming
);
router.get(
  "/appointments/upcoming/doctor/:doctorId",
  requireAuth,
  appointmentController.get_upcoming_doctor
);
router.get(
  "/past-appointments/doctor/:doctorId",
  requireAuth,
  appointmentController.get_history_doctor
);
router.get(
  "/past-appointments/patient/:patientId",
  requireAuth,
  appointmentController.get_history_patient
);
//POST REQUEST
router.post(
  "/appointment/book",
  requireAuth,
  appointmentController.book_appointment
);

//PUT REQUEST
router.put(
  "/appointment/:appointmentId/approve",
  requireAuth,
  isDoctor,
  appointmentController.approve_appointment
);
router.put(
  "/appointment/:appointmentId/decline",
  requireAuth,
  isDoctor,
  appointmentController.decline_appointment
);
router.put(
  "/appointment/cancel/:appointmentId/:userId",
  requireAuth,
  appointmentController.cancel_appointment
);
router.put(
  "/appointment/reschedule/:appointmentId",
  requireAuth,
  isDoctor,
  appointmentController.reschedule_appointment
);
//--------------------------------------------

module.exports = router;
