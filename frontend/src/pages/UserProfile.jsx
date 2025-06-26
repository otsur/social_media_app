import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem("token");

  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);


 useEffect(() => {
  const fetchProfile = async () => {
    try {
      const userRes = await axios.get(`${baseURL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = userRes.data.data;

      const profileRes = await axios.get(`${baseURL}/api/v1/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(profileRes.data.data);

     
      setIsFollowing(currentUser.following.includes(id));
      setCurrentUserId(currentUser._id);

      
      const postRes = await axios.get(`${baseURL}/api/v1/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userPosts = postRes.data.data.filter(
        (post) => post.author._id === id
      );
      setPosts(userPosts);


      
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  fetchProfile();
}, [id]);





        const handleFollowToggle = async () => {
        const token = localStorage.getItem("token");

        try {
            const url = `${baseURL}/api/v1/users/${id}/${isFollowing ? "unfollow" : "follow"}`;
            await axios.post(url, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error("Follow/Unfollow error:", err);
        }
        };


  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <img
        src={profile.profilePic || "https://via.placeholder.com/150"}
        alt="Profile"
        style={{ width: "150px", borderRadius: "50%" }}
      />
      <h2>{profile.username}</h2>
      <p><strong>Followers:</strong> {profile.followers?.length || 0}</p>
      <p><strong>Following:</strong> {profile.following?.length || 0}</p>

      <p>{profile.bio}</p>
                {currentUserId !== id && (
                <button
                    onClick={handleFollowToggle}
                    style={{
                    backgroundColor: isFollowing ? "lightcoral" : "lightblue",
                    color: "white",
                    margin: "10px 0",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    }}
                >
                    {isFollowing ? "Unfollow" : "Follow"}
                </button>
                )}

      <h3>Posts</h3>
      {posts.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <p>{post.caption}</p>
            {post.mediaType === "image" && <img src={post.mediaUrl} alt="" style={{ maxWidth: "100%" }} />}
            {post.mediaType === "video" && (
              <video controls style={{ maxWidth: "100%" }}>
                <source src={post.mediaUrl} />
              </video>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default UserProfile;
