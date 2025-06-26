import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    axios
      .get(`${baseURL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userData = res.data.data;
        setUser(userData);
        setUsername(userData.username || "");
        setBio(userData.bio || "");
        setProfilePic(userData.profilePic || "");
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        `${baseURL}/api/v1/user/update-profile`,
        { username, bio, profilePic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/my-profile"), 1000);
    } catch (err) {
      console.error("Update error:", err);
      setMessage("Failed to update profile.");
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <br />
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        <br /><br />

        <label>Bio:</label>
        <br />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        <br /><br />

        <label>Profile Pic URL:</label>
        <br />
        <input value={profilePic} onChange={(e) => setProfilePic(e.target.value)} />
        <br /><br />

        <button type="submit">Save</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default EditProfile;
