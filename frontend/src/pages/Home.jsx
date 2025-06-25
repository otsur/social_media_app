import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("No token found. Redirecting...");
        setTimeout(() => navigate("/login"), 1000);
        return;
      }

      try {
        const res = await axios.get(`${baseURL}/api/v1/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.data);
        setMessage("Welcome!");
      } catch (err) {
        console.error("AUTH ERROR:", err);
        setMessage("Invalid or expired token");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Home Feed</h2>
      <p>{message}</p>
      {user && (
        <>
          <p>Welcome, {user.username}!</p>
          <p>Email: {user.email}</p>
        </>
      )}
    </div>
  );
};

export default Home;
