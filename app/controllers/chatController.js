const Chat = require("../models/Chat");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");

module.exports.get_chat = async (req, res) => {
  const { receiverId, role } = req.body;
  const { userId } = req.params;
  try {
    const findSender = await User.findOne({ userId: userId });
    const findReceiver = await User.findOne({ userId: receiverId });
    if (findReceiver && findSender) {
      var isChat = await Chat.find({
        isGroupChat: false,
        users: { $all: [findSender._id, findReceiver._id] },
      }).populate({
        path: "users",
        model: "User",
        populate: {
          path: "userDetails",
          model: "User",
          select: "firstName lastName email profilePicture",
        },
      });
      if (isChat.length > 0) {
        isChat = await isChat.populate("latestMessage");
        return res.status(200).json({
          status: "OK",
          message: "Chat fetched Successfully",
          data: isChat[0],
        });
      } else {
        var charData = {
          chatName: "sender",
          isGroupChat: false,
          users: [findSender._id, findReceiver._id],
          unreadMessages: [
            {
              userId: findSender._id,
              unread: 0,
            },
            {
              userId: findReceiver._id,
              unread: 0,
            },
          ],
        };
        try {
          const createdChat = await Chat.create(charData);
          let fullChat = await Chat.findOne({
            _id: createdChat._id,
          }).populate({
            path: "users",
            model: "User",
            populate: {
              path: "userDetails",
              model: "User",
              select: "firstName lastName email profilePicture",
            },
          });
          fullChat = await fullChat.populate("latestMessage");
          return res.status(200).json({
            status: "OK",
            message: "Chat fetched Successfully",
            data: fullChat,
          });
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            status: "ERROR",
            message: "Something Went Wrong While Creating Chat",
          });
        }
      }
    } else {
      return res.status(400).json({
        status: "ERROR",
        message: "User Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "ERROR",
      message: "Something Went Wrong",
    });
  }
};
module.exports.get_chats = async (req, res) => {
  try {
    const { userId } = req.params;
    const findUser = await User.findOne({ userId: userId });
    var chats = await Chat.find({
      users: { $elemMatch: { $eq: findUser._id } },
    })
      .populate({
        path: "users",
        model: "User",
        populate: {
          path: "userDetails",
          model: "User",
          select: "firstName lastName email profilePicture",
        },
      })
      .populate({
        path: "unreadMessages.userId",
        model: "User",
        populate: {
          path: "userDetails",
          model: "User",
          select: "firstName lastName email profilePicture",
        },
      })
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    return res.status(200).json({
      status: "OK",
      message: "Chats fetched Successfully",
      data: chats,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Something Went Wrong",
    });
  }
};

module.exports.read_chat = async (req, res) => {
  const { chatId, userId } = req.params;
  const findUser = await User.findOne({ userId: userId });

  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $set: { "unreadMessages.$[elem].unread": 0 } },
      {
        arrayFilters: [{ "elem.userId": findUser._id }],
        new: true,
      }
    );
    return res.status(200).json({
      status: "OK",
      message: "Chat Read",
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Something Went Wrong",
    });
  }
};
