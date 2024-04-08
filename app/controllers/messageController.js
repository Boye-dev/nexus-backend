const Chat = require("../models/Chat");
const Doctor = require("../models/Doctor");
const Message = require("../models/Message");
const Patient = require("../models/Patient");
const User = require("../models/User");

module.exports.post_message = async (req, res) => {
  const { content, chatId } = req.body;
  const { userId } = req.params;

  try {
    const findUser = await User.findOne({ userId: userId });

    var newMessage = {
      sender: findUser._id,
      content,
      chat: chatId,
    };
    let message = await Message.create(newMessage);
    message = await message.populate({
      path: "sender",
      model: "User",
      populate: {
        path: "userDetails",
        model: "User",
        select: "firstName lastName email profilePicture",
      },
    });
    message = await Message.populate(message, "chat");
    finalMessage = await Message.populate(message, {
      path: "chat.users",
      model: "User",
      populate: {
        path: "userDetails",
        model: "User",
        select: "firstName lastName",
      },
    });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    return res.status(200).json({
      status: "OK",
      message: "Message fetched Successfully",
      data: finalMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "ERROR",
      message: "Something Went Wrong",
    });
  }
};

module.exports.get_messages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate({
        path: "sender",
        model: "User",
        populate: {
          path: "userDetails",
          model: "User",
          select: "firstName lastName email profilePicture",
        },
      })
      .populate("chat");
    let finalMessage = await Message.populate(messages, {
      path: "chat.users",
      model: "User",
      populate: {
        path: "userDetails",
        model: "User",
        select: "firstName lastName",
      },
    });

    return res.status(200).json({
      status: "OK",
      message: "Messages fetched Successfully",
      data: finalMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "ERROR",
      message: "Something Went Wrong",
    });
  }
};
