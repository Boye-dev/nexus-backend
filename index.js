require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const path = require("path");
const { connectToDB } = require("./config/database");
const PORT = process.env.PORT || process.env.SERVER_PORT || 4000;
const patientRoutes = require("./app/routes/patientRoutes");
const doctorRoutes = require("./app/routes/doctorRoutes");
const appointmentRoutes = require("./app/routes/appointmentRoutes");
const chatRoutes = require("./app/routes/chatRoutes");
const messageRoutes = require("./app/routes/messageRoutes");
const socket = require("socket.io-client")("http://localhost:3000");
const { Server } = require("socket.io");
const announcementsRoutes = require("./app/routes/announcementsRoutes");
const subscribersRoutes = require("./app/routes/subscribersRoutes");
const authRoutes = require("./app/routes/authRoutes");
const { requireAuth, checkUser } = require("./app/middlewares/authMiddleware");
const Doctor = require("./app/models/Doctor");
const Patient = require("./app/models/Patient");
const Notification = require("./app/models/Notification");
const User = require("./app/models/User");
const Chat = require("./app/models/Chat");

const app = express();
const apiVersion = "/api/v1";

//Middleware
//To allow json requests and decode requests from forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});
//To allow Cookies
app.use(cookieParser()); // To parse the incoming cookies
const corsOptions = {
  credentials: true,
  origin: ["https://nexus-frontend-rho.vercel.app", "http://localhost:3000", "http://localhost:5173","https://nexus-prototype.vercel.app"],
  // origin: "http://localhost:3000",
};
app.use(cors(corsOptions)); // npm i cors

// const io = require("socket.io")(8900, {
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

//Routes
// app.get("*", checkUser);
app.use(apiVersion, patientRoutes); //Call routes here
app.use(apiVersion, authRoutes); //Call routes here
app.use(apiVersion, doctorRoutes); //Call routes here
app.use(apiVersion, appointmentRoutes); //Call routes here
app.use(apiVersion, chatRoutes); //Call routes here
app.use(apiVersion, messageRoutes); //Call routes here
app.use(apiVersion, announcementsRoutes); //Call routes here
app.use(apiVersion, subscribersRoutes); //Call routes here
// app.use(apiVersion, requireAuth, "../homeRoute");
app.use("/api/uploads", express.static("api/uploads"));

//Invalid Route   //NB: using app.use instead of app.get/post handles all wrong requests and throws the message (For our API in dev/prod)
app.use("*", (req, res) => {
  res.status(404).send({ error: "Route does not exist" });
});
app.use((error, req, res, next) => {
  console.log("This is the rejected field ->", error);
  // console.log("This is the rejected field ->", error.field);
  res.status(400).json({ error: "Multer Error. Unexpected field -  ", error });
});

//Server and Database setup
const server = http.createServer(app);
// Only start server after connection to database has been established
const io = new Server(server, {
  cors: {
    origin: "https://nexus-frontend-rho.vercel.app",
  },
});
let users = [];
let usersInRoom = new Map();
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user connected");
  //take userId and socketId
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);

    io.emit("getUsers", users);
  });
  socket.on("typing", (data) => {
    const receiver = data.chat.users.filter(
      (item) => data.userId !== item.userId
    );
    const sender = data.chat.users.filter(
      (item) => data.userId === item.userId
    );
    const user = getUser(receiver[0].userId);
    io.to(user?.socketId).emit("type", {
      typing: true,
      sender,
    });
  });
  socket.on("stopTyping", (data) => {
    const receiver = data.chat.users.filter(
      (item) => data.userId !== item.userId
    );
    const sender = data.chat.users.filter(
      (item) => data.userId === item.userId
    );
    const user = getUser(receiver[0].userId);
    io.to(user?.socketId).emit("stopType", {
      typing: false,
      sender,
    });
  });
  socket.on("joinRoom", (data) => {
    usersInRoom.set(socket.id, { userId: data.userId, roomId: data.chat });

    socket.join(data.chat);

    console.log("Users in room", usersInRoom);
  });

  // Handle leaving a room
  socket.on("leaveRoom", (room) => {
    usersInRoom.delete(socket.id);
    socket.leave(room);
    console.log(`User left room: ${room}`);

    console.log("Users in room", usersInRoom);
  });

  // Handle checking if a user is in a room
  socket.on("checkUserInRoom", (data) => {
    const { room, userId } = data;
    const inRoom = io.sockets.adapter.rooms.get(room)?.has(userId) ?? false;
    socket.emit("userInRoom", { room, userId, inRoom });
  });
  socket.on("getNotification", async (data) => {
    const receiver = data.chat.users.filter(
      (item) => data.userId !== item.userId
    );
    const sender = data.chat.users.filter(
      (item) => data.userId === item.userId
    );

    const receiverUserId = getUser(receiver[0].userId);

    console.log("User in socket", receiverUserId);
    const isUserInRoom = Array.from(
      io.sockets.adapter.rooms.get(data.chat._id) || []
    ).some((socketId) => {
      const user = usersInRoom.get(socketId);
      return user && user.userId === receiverUserId?.userId;
    });

    console.log("Notification checking", isUserInRoom);

    if (receiverUserId) {
      if (!isUserInRoom) {
        User.findOne({ userId: receiver[0].userId })
          .populate("userDetails")
          .then((user) => {
            Chat.findOneAndUpdate(
              { _id: data.chat._id, "unreadMessages.userId": user._id },
              { $inc: { "unreadMessages.$.unread": 1 } },
              { new: true }
            )
              .then((chat) => {
                if (chat) {
                  console.log("Unread count updated successfully");

                  console.log("Notification online");
                  io.to(receiverUserId.socketId).emit("notification", {
                    message: `New message from ${user.userDetails.lastName} ${user.userDetails.firstName}`,
                    chat: data.chat._id,
                    unread: chat.unreadMessages.find(
                      (message) =>
                        message.userId.toString() === user._id.toString()
                    )?.unread,
                    sender,
                  });
                  // Handle the updated chat object
                } else {
                  console.log("User not found in the unreadMessages array");
                }
              })
              .catch((error) => {
                console.log(error);
                // Handle the error
              });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } else {
      console.log("Notification offline");

      User.findOne({ userId: receiver[0].userId })
        .populate("userDetails")
        .then((user) => {
          const newNotification = new Notification({
            type: "Message",
            title: "New Message",
            content: `New message from ${user.userDetails.lastName} ${user.userDetails.firstName}`,
            userStatus: { userId: user._id, status: "unread" },
          });

          newNotification
            .save()
            .then(() => {
              Chat.findOneAndUpdate(
                { _id: data.chat._id, "unreadMessages.userId": user._id },
                { $inc: { "unreadMessages.$.unread": 1 } },
                { new: true }
              )
                .then((chat) => {
                  if (chat) {
                    console.log("Unread count updated successfully");

                    console.log("Notification online");
                  } else {
                    console.log("User not found in the unreadMessages array");
                  }
                })
                .catch((error) => {
                  console.log(error);
                  // Handle the error
                });
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.error(error);
          // Handle the error
        });
    }
  });
  socket.on("sendMessage", (newMessageReceived) => {
    console.log(newMessageReceived, "New message received");
    const fullUsers = newMessageReceived.chat.users;
    const receiver = fullUsers.filter(
      (item) => newMessageReceived.sender.userId !== item.userId
    );
    console.log("Receiver[0]", receiver[0]);
    const user = getUser(receiver[0].userId);
    const senderUser = getUser(newMessageReceived.sender.userId);
    console.log("All users", users);
    if (user) {
      // console.log(user.socketId, "receiver");
      // console.log(senderUser.socketId, "sender");

      io.to(user.socketId).emit("getMessage", { newMessageReceived });
    }
    if (senderUser) {
      io.to(senderUser.socketId).emit("getLatestMessage", {
        newMessageReceived,
      });
      io.to(user?.socketId).emit("getLatestMessage", {
        newMessageReceived,
      });
    }
  });

  socket.on("getMessages", ({ messages, receiverId }) => {
    console.log("Messages", messages);
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      messages,
    });
    io.to(user?.socketId).emit("getMessage", {
      messages,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected ");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
connectToDB()
  .then(() => {
    //Starting Server/Listening to server

    server.listen(PORT, () => {
      console.log(`Server listening on PORT ${PORT}`);
    });
  })
  .catch(() => {
    console.log("Database connection failed!");
  });

//If any error in starting server
server.on("error", (err) => {
  console.log(`Error Present: ${err}`);
  process.exit(1);
});

// If any unhandledRejection in our process Event
process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION! Shutting down...", error);
  process.exit(1);
});
