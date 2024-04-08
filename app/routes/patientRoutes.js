const { Router } = require("express");
const router = Router();
const patientController = require("../controllers/patientController");
const authController = require("../controllers/authController");
const {
  patientSignupValidator,
  validate,
  patientLoginValidator,
} = require("../validations/patientValidation");
const { requireAuth } = require("../middlewares/authMiddleware");
const { upload } = require("../services/upload");

//GET Requests
router.get("/logout", authController.logout_get);
router.get(
  "/patient/verify/:patientId/:uniqueString",
  patientController.verify_user
);
router.get("/patient/:id", patientController.get_patient);

//POST Requests
router.post(
  "/patient/signup",
  upload.single("profilePicture"),
  patientSignupValidator(),
  validate,
  patientController.signup_post
);
router.post("/patient/forgotPassword", patientController.forgot_password);
router.post("/patient/resetPassword", patientController.reset_password);
router.post(
  "/patient/login",
  patientLoginValidator(),
  validate,
  patientController.login_post
);

//PUT Requests
router.put(
  "/patient/updatePassword/:id",
  requireAuth,
  patientController.update_password
);
router.put(
  "/patient/editProfile/:id",
  requireAuth,
  upload.single("profilePicture"),
  patientController.edit_profile
);

module.exports = router;
