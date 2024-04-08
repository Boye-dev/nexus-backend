const { Router } = require("express");
const router = Router();
const messageController = require("../controllers/messageController");
const { requireAuth, isDoctor } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

router.post("/message/:userId", messageController.post_message);
router.get("/messages/:chatId", messageController.get_messages);

module.exports = router;
