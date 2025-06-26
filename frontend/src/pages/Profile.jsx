import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const { id } = useParams(); // Get user ID from URL
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>User not found</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{profile.username}'s Profile</h2>
      {profile.profilePic && (
        <img
          src={profile.profilePic}
          alt="Profile"
          style={{ width: "100px", borderRadius: "50%" }}
        />
      )}
      <p>Email: {profile.email}</p>
      <p>Bio: {profile.bio || "No bio available."}</p>
      <p>Followers: {profile.followers.length}</p>
      <p>Following: {profile.following.length}</p>
    </div>
  );
};

export default Profile;
