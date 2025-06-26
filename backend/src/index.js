import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({
    path: './env'
})

const server = http.createServer(app); 
const users = new Map();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // You can restrict this to your frontend origin
    methods: ["GET", "POST"],
    credentials: true
  },
});

connectDB()
.then(() => {

io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  socket.on("addUser", (userId) => {
    users.set(userId, socket.id);
    console.log("👤 User added:", userId);

    // Send list of all currently connected user IDs
    const onlineIds = [...users.keys()];
    console.log("📤 Emitting getUsers:", onlineIds);
    io.emit("getUsers", onlineIds);
  });


socket.on("sendMessage", ({ senderId, receiverId, message }) => {
  const receiverSocketId = users.get(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receiveMessage", {
      senderId,
      message,
    });
  }
});


  socket.on("disconnect", () => {
    for (const [userId, id] of users.entries()) {
      if (id === socket.id) {
        users.delete(userId);
        break;
      }
    }
    io.emit("getUsers", [...users.keys()]);
    console.log("❌ A user disconnected:", socket.id);
  });
});


    app.on("error",(error) => {
        console.log("ERROR:",error);
        throw error
    })


    server.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MONGODB connection failed",error);
})