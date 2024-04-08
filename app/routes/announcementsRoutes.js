const { Router } = require("express");
const router = Router();
const announcementsController = require("../controllers/announcementsController");
const {
  requireAuth,
  isDoctor,
  isVerified,
} = require("../middlewares/authMiddleware");

//GET REQUESTS
router.get(
  "/announcements/patient/:patientId",
  requireAuth,
  isVerified,
  announcementsController.getAnnouncementsForPatient
);
router.get(
  "/announcements/doctor/:doctorId",
  requireAuth,
  isDoctor,
  isVerified,
  announcementsController.getAnnouncementsForDoctor
);

router.post(
  "/announcements",
  requireAuth,
  isVerified,
  isDoctor,
  announcementsController.createAnnouncement
);

router.delete(
  "/announcements/:announcementId",
  requireAuth,
  isVerified,
  isDoctor,
  announcementsController.deleteAnnouncement
);

router.put(
  "/announcements/patient/:announcementId/:patientId",
  requireAuth,
  isVerified,
  announcementsController.updateStatusToReadPatient
);
router.put(
  "/announcements/doctor/:announcementId/:doctorId",
  requireAuth,
  isVerified,
  announcementsController.updateStatusToReadDoctor
);

module.exports = router;
