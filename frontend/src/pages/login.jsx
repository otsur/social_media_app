import { useState } from "react";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const Login = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await axios.post(`${baseURL}/api/v1/auth/login`, formData);
      console.log("LOGIN SUCCESS:", res.data);

      const token = res.data.data.token;
      localStorage.setItem("token", token); // Save token

      setMessage("Login successful!");

      // ✅ Call onSuccess passed from AuthPage
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </>
  );
};

export default Login;
