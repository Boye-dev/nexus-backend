const { Router } = require("express");
const router = Router();
const subscriberController = require("../controllers/subscriberController");

//GET Requests
router.get("/subscribers", subscriberController.getSubscribers);

//POST Requests
router.post(
  "/newsletter-subscribe",
  subscriberController.createSubscriber
);

module.exports = router;
