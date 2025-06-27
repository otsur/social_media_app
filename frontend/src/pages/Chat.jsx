import { useEffect, useState, useRef } from "react";
import { socket } from "../utils/socket";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Chat.css";


const baseURL = import.meta.env.VITE_API_BASE_URL;

console.log(`baseURL ${baseURL}`);

const Chat = () => {
  const navigate = useNavigate();

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [onlineUsersInfo, setOnlineUsersInfo] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

   const firstLoadRef = useRef(true);
   const restoredFromLocal = useRef(false);

  useEffect(() => {
    // Get logged-in user
    const fetchUser = async () => {
      const res = await axios.get(`${baseURL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
      socket.emit("addUser", res.data.data._id);
      // console.log("🔌 Emitting addUser with ID:", res.data.data._id);

const stored = localStorage.getItem("selectedUser");
if (stored) {
  // setSelectedUser(JSON.parse(stored));
  const parsedUser = JSON.parse(stored);
  setSelectedUser(parsedUser);

  const storedMsgs = localStorage.getItem(`chat_${parsedUser._id}`);
  if (storedMsgs) {
    setMessages(JSON.parse(storedMsgs));
  }
   restoredFromLocal.current = true;
}




    };
    fetchUser();
  }, []);

 useEffect(() => {
 
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


 socket.on("getUsers", (userIds) => {
    //  console.log("🌐 Online users received from server:", userIds);
    if(!user) return;
    const filtered = userIds.filter((id) => id !== user?._id);
    setOnlineUsers(filtered);
    fetchUserDetails(filtered);
  });

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



//-------------------

useEffect(() => {
  if (messages.length > 0 && selectedUser) {
    localStorage.setItem(`chat_${selectedUser._id}`, JSON.stringify(messages));
  }
}, [messages, selectedUser]);


  //------------
  useEffect(() => {
  const fetchMessages = async () => {
    if (!selectedUser || !user) return;

  const isSelectedUserOnline = onlineUsersInfo.some(
      (u) => u._id === selectedUser._id
    );


if (!isSelectedUserOnline && !restoredFromLocal.current) {
      return;
    }

    try {
     
     
      if (firstLoadRef.current && messages.length > 0) {
        firstLoadRef.current = false;
        restoredFromLocal.current = false;
        setLoadingMessages(false);
        return;
      }

       setLoadingMessages(true);
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
         timestamp: msg.createdAt, 
      }));

      setMessages(formattedMessages);
      setLoadingMessages(false);
       restoredFromLocal.current = true;
    } catch (err) {
      console.error("Error fetching messages:", err);
     
    }finally{
      setLoadingMessages(false);
      firstLoadRef.current = false;
    }
  };
console.log("Selected user:", selectedUser);
  fetchMessages();
}, [selectedUser, user]);


// ----------------------------auto scroll to latest
useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);
// ------------------------------

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

    setMessages((prev) => [
      ...prev,
      {
        fromSelf: true,
        message: input,
        timestamp: new Date().toISOString(), // Add this
      },
    ]);

    setInput("");
  } catch (err) {
    console.error("Message send error:", err);
  }
};


  
 return (

<div className="char-container">
{/* ------------ */}
<button
  onClick={() => navigate("/")}
  style={{
    margin: "10px 20px",
    padding: "5px 10px",
    backgroundColor: "#A9A9A9",
    color: "white",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
   Back
</button>

{/* ----------- */}


  <div style={{ 
    display: "flex",
    height: "100vh",
    fontFamily: "sans-serif",
    backgroundColor: "#0000"
   }}>

    {/* Left Panel - User List */}
    <div className="chat-sidebar">

  <h3 style={{ marginBottom: "15px" }}>Online Users</h3>
  {onlineUsersInfo.length === 0 ? (
    <p>No users online</p>
  ) : (
    onlineUsersInfo.map((userItem) => (
      <div
        key={userItem._id}
        className={`chat-user ${selectedUser?._id === userItem._id ? "selected" : ""}`}
        onClick={() => {
          setSelectedUser(userItem);
          localStorage.setItem("selectedUser", JSON.stringify(userItem));
        }}
      >
        <img
          src={userItem.profilePic || "https://via.placeholder.com/40"}
          alt={userItem.username}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            marginRight: "10px"
          }}
        />
        <span style={{ fontWeight: "500" }}>{userItem.username}</span>
      </div>
    ))
  )}
</div>

    {/* Right Panel - Chat */}
    <div className="chat-main">

  <div style={{
    fontWeight: "600",
    fontSize: "18px",
    marginBottom: "10px",
    color: "#ffff"
  }}>
    {selectedUser ? `Chatting with ${selectedUser.username}` : "Select a user to start chatting"}
  </div>

  {/* Chat Messages */}
  <div className="chat-box">

    {loadingMessages ? (
      <p>Loading messages...</p>
    ) : (
      messages.map((msg, idx) => (
        <div
          key={idx}
          style={{
            textAlign: msg.fromSelf ? "right" : "left",
            marginBottom: "8px",
          }}
        >
          <div
            key={idx}
            className={`chat-message ${msg.fromSelf ? "sent" : "received"}`}
          >
            {msg.message}
          </div>
          <div style={{ fontSize: "11px", color: "gray", marginTop: "2px" }}>
            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
          </div>
        </div>

      ))
    )}
     <div ref={messagesEndRef}></div>
  </div>

  {/* Input Area */}
  <div className="chat-input">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Type a message..."
      style={{
        flexGrow: 1,
        padding: "12px 16px",
        fontSize: "16px",
        borderRadius: "20px",
        border: "1px solid #ccc",
        outline: "none"
      }}
    />
    <button className="sendBtn"
      onClick={handleSend}
    >
      send
    </button>
  </div>
</div>

  </div>
  </div>
);
}

export default Chat;
