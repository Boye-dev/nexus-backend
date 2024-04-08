const { Router } = require("express");
const router = Router();
const chatController = require("../controllers/chatController");
const { requireAuth, isDoctor } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

router.get("/chat/:userId", chatController.get_chat);
router.get("/chats/:userId", chatController.get_chats);
router.put("/chat/read/:chatId/:userId", chatController.read_chat);
router.post("/push", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    const patients = await Patient.find();

    // Create users from doctors
    for (const doctor of doctors) {
      const newUser = new User({
        userId: doctor._id, // Assign the existing _id from the doctor document
        role: "Doctor",
        // Set other fields as needed
      });

      await newUser.save();
    }

    // Create users from patients
    for (const patient of patients) {
      const newUser = new User({
        userId: patient._id, // Assign the existing _id from the patient document
        role: "Patient",
        // Set other fields as needed
      });

      await newUser.save();
    }

    console.log("Users created successfully.");
  } catch (error) {
    res.send(error);
    console.error("Error creating users:", error);
  }
});
// router.post("/chat", chatController.post_chat);

module.exports = router;
