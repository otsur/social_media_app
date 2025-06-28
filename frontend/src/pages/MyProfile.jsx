import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    bio: "",
    profilePic: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.data);
        setForm({
          username: res.data.data.username,
          email: res.data.data.email,
          bio: res.data.data.bio || "",
          profilePic: res.data.data.profilePic || "",
        });
        
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
       // First upload image if user selected a new file
            let profilePicUrl = form.profilePic;
            if (form.profilePicFile) {
            const formData = new FormData();
            formData.append("file", form.profilePicFile);

            const uploadRes = await axios.post(
                `${baseURL}/api/v1/users/upload-profile-pic`,
                formData,
                {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                }
            );

            profilePicUrl = uploadRes.data.data.profilePic;
            }

            // Then update profile with other fields
            const res = await axios.put(
            `${baseURL}/api/v1/users/update`,
            {
                username: form.username,
                email: form.email,
                bio: form.bio,
                profilePic: profilePicUrl,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
            );
      setUser(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="home-container">
      <h2 className="home-heading">My Profile</h2>

      {editing ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            required
          /><br />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          /><br />
          <input
            type="text"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Bio"
          /><br />
          <label htmlFor="">Upload profile pic : </label>
         <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm((prev) => ({ ...prev, profilePicFile: e.target.files[0] }))}
            required
        /> <br />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <img
            src={user.profilePic || "/default-profile.png"}
            alt="Profile"
            className="profile-pic"
          />
    <div className="labelProfile">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Followers:</strong> {user.followers?.length || 0}</p>
          <p><strong>Following:</strong> {user.following?.length || 0}</p>

          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Bio:</strong> {user.bio || "No bio provided."}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
    </div>
        </>
      )}
    </div>
  );
};

export default MyProfile;
