const { Router } = require("express");
const router = Router();
const doctorController = require("../controllers/doctorController");
const authController = require("../controllers/authController");
const {
  doctorSignupValidator,
  validate,
  doctorLoginValidator,
} = require("../validations/doctorValidation");
const { requireAuth } = require("../middlewares/authMiddleware");
const { upload } = require("../services/upload");

//GET Requests
router.get("/logout", authController.logout_get);
router.get(
  "/doctor/verify/:doctorId/:uniqueString",
  doctorController.verify_user
);
router.get("/doctor/:id", doctorController.get_doctor);

//POST Requests
router.post(
  "/doctor/signup",
  upload.single("profilePicture"),
  doctorSignupValidator(),
  validate,
  doctorController.signup_post
);
router.post("/doctor/forgotPassword", doctorController.forgot_password);
router.post("/doctor/resetPassword", doctorController.reset_password);
router.post(
  "/doctor/login",
  doctorLoginValidator(),
  validate,
  doctorController.login_post
);

//PUT Requests
router.put(
  "/doctor/updatePassword/:id",
  requireAuth,
  doctorController.update_password
);
router.put(
  "/doctor/editProfile/:id",
  requireAuth,
  upload.single("profilePicture"),
  doctorController.edit_profile
);

module.exports = router;
