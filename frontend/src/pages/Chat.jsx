import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;


const Chat = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [onlineUsersInfo, setOnlineUsersInfo] = useState([]);
  

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Get logged-in user
    const fetchUser = async () => {
      const res = await axios.get(`${baseURL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
      socket.emit("addUser", res.data.data._id);
      // console.log("🔌 Emitting addUser with ID:", res.data.data._id);

    };
    fetchUser();
  }, []);

 useEffect(() => {
  socket.on("getUsers", (userIds) => {
    //  console.log("🌐 Online users received from server:", userIds);
    const filtered = userIds.filter((id) => id !== user?._id);
    setOnlineUsers(filtered);
    fetchUserDetails(filtered);
  });
 

// --------------
const fetchUserDetails = async (userIds) => {
  try {
    const token = localStorage.getItem("token");

    const userDetailPromises = userIds.map(id =>
      axios.get(`${baseURL}/api/v1/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    );

    const results = await Promise.all(userDetailPromises);
    const userInfo = results.map(res => res.data.data);
    setOnlineUsersInfo(userInfo);
  } catch (err) {
    console.error("Error fetching online user info", err);
  }
};
// --------------

  socket.on("receiveMessage", (data) => {
    if (data.senderId === selectedUser?._id) {
      setMessages((prev) => [...prev, { fromSelf: false, message: data.message }]);
    }
  });

  return () => {
    socket.off("getUsers");
    socket.off("receiveMessage");
  };
}, [selectedUser]);


  //------------
  useEffect(() => {
  const fetchMessages = async () => {
    if (!selectedUser || !user) return;

    try {
      const token = localStorage.getItem("token");

      // Create or fetch chat
      const chatRes = await axios.post(`${baseURL}/api/v1/chats`, {
        userId: selectedUser._id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const chatId = chatRes.data.data._id;

      // Get messages in chat
      const messageRes = await axios.get(`${baseURL}/api/v1/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const msgs = messageRes.data.data;

      const formattedMessages = msgs.map((msg) => ({
        fromSelf: msg.sender === user._id,
        message: msg.content,
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  fetchMessages();
}, [selectedUser]);


  const handleSend = async () => {
  if (!input.trim() || !selectedUser || !user) return;
    const token = localStorage.getItem("token");
  try {
    // Check or create a chat

    const chatRes = await axios.post(`${baseURL}/api/v1/chats`, {
      userId: selectedUser._id,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const chatId = chatRes.data.data._id;

    // save message in backend
   await axios.post(`${baseURL}/api/v1/messages`, {
      chatId,
      content: input,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Emit via socket
    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: input,
    });

    setMessages((prev) => [...prev, { fromSelf: true, message: input }]);
    setInput("");
  } catch (err) {
    console.error("Message send error:", err);
  }
};



  
 return (
  <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
    {/* Left Panel - User List */}
    <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: "10px" }}>
      <h3>Online Users</h3>
      {onlineUsersInfo.length === 0 ? (
        <p>No users online</p>
      ) : (
        onlineUsersInfo.map((userItem) => (
          <div
            key={userItem._id}
            onClick={() => setSelectedUser(userItem)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: selectedUser?._id === userItem._id ? "#e0f7fa" : "transparent",
              borderRadius: "5px",
            }}
          >
            <img
              src={userItem.profilePic || "https://via.placeholder.com/40"}
              alt={userItem.username}
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            <span>{userItem.username}</span>
          </div>
        ))
      )}
    </div>

    {/* Right Panel - Chat */}
    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
      <h3>
        {selectedUser ? `Chatting with ${selectedUser.username}` : "Select a user to start chat"}
      </h3>

      <div
        style={{
          flexGrow: 1,
          border: "1px solid #ccc",
          padding: "10px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.fromSelf ? "right" : "left",
              marginBottom: "8px",
              padding: "8px",
              backgroundColor: msg.fromSelf ? "#dcf8c6" : "#fff",
              display: "inline-block",
              borderRadius: "5px",
              maxWidth: "60%",
            }}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flexGrow: 1, padding: "8px", fontSize: "16px" }}
        />
        <button onClick={handleSend} style={{ padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </div>
  </div>
);
}

export default Chat;
