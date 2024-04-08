const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification"); // Assuming you have defined and exported the Notification model
const User = require("../models/User");

module.exports.getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    const foundUser = await User.findOne({ userId });

    if (!foundUser) {
      return res.status(404).json({
        status: "ERROR",
        message: "User not found",
      });
    }
    let notifications;
    if (status) {
      notifications = await Notification.find({
        userStatus: { $elemMatch: { userId: foundUser.id, status: status } },
      })
        .select("title content type createdAt userStatus.$")
        .sort({ createdAt: -1 });
    } else {
      notifications = await Notification.find({
        userStatus: { $elemMatch: { userId: foundUser.id } },
      })
        .select("title content type createdAt userStatus.$")
        .sort({ createdAt: -1 });
    }

    res.json({
      status: "OK",
      count: notifications.length,
      message: "Notification details retrieved successfully",
      data: {
        notifications,
      },
    });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve notifications",
      error: error.message,
    });
  }
};

module.exports.readAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const foundUser = await User.findOne({ userId });

    if (!foundUser) {
      return res.status(404).json({
        status: "ERROR",
        message: "User not found",
      });
    }

    // Find all notifications for the user
    const notifications = await Notification.find({
      "userStatus.userId": foundUser._id,
    });

    // Update the status to "read" for all user statuses in the userStatus array
    notifications.forEach((notification) => {
      notification.userStatus.forEach((status) => {
        if (status.userId.equals(foundUser._id)) {
          status.status = "read";
        }
      });
    });

    // Save the updated notifications
    await Promise.all(notifications.map((notification) => notification.save()));

    res.json({
      status: "OK",
      message: "All notifications marked as read for the user",
      data: notifications,
    });
  } catch (error) {
    console.error("Error updating notification status:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to update notification status",
      error: error.message,
    });
  }
};

// GET notifications by userId and update status to "read"
module.exports.readNotifications = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    const foundUser = await User.findOne({ userId });

    if (!foundUser) {
      return res.status(404).json({
        status: "ERROR",
        message: "User not found",
      });
    }

    // Find the notification with matching ID and user ID
    const notification = await Notification.findOne({
      _id: notificationId,
      "userStatus.userId": foundUser._id,
    });

    if (!notification) {
      return res.status(404).json({
        status: "ERROR",
        message: "Notification not found for the user",
      });
    }

    // Update the status to "read" in the userStatus array
    const userStatus = notification.userStatus.find((status) =>
      status.userId.equals(foundUser._id)
    );

    if (userStatus) {
      userStatus.status = "read";
      await notification.save();
    }

    res.json({
      status: "OK",
      message: "Notification status updated successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error updating notification status:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to update notification status",
      error: error.message,
    });
  }
};
