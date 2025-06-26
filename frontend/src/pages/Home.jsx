import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { socket } from "../utils/socket";


const baseURL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [message, setMessage] = useState("Loading...");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");

  const limit = 5;

  const navigate = useNavigate();


  const handleLike = async (postId) => {
  const token = localStorage.getItem("token");

  if (!token || !user || !user._id) {
    console.warn("Like blocked: user not ready");
    return;
  }

  const post = posts.find((p) => p._id === postId);
  if (!post) {
    console.warn("Post not found");
    return;
  }

  const hasLiked = post.likes.includes(user._id);

  const url = hasLiked
    ? `${baseURL}/api/v1/posts/${postId}/unlike`
    : `${baseURL}/api/v1/posts/${postId}/like`;

  try {
    await axios.post(url, null, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await axios.get(`${baseURL}/api/v1/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPosts(res.data.data);
  } catch (err) {
    console.error("Like/Unlike error:", err);
  }
};



  const handleCommentSubmit = async (e, postId) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const commentInput = e.target[`comment-${postId}`];
  const text = commentInput.value;

  try {
    await axios.post(`${baseURL}/api/v1/comments/${postId}`, { text }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    commentInput.value = "";

    // Refresh posts
    const res = await axios.get(`${baseURL}/api/v1/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(res.data.data);
  } catch (err) {
    console.error("Comment error:", err);
  }
};


const handleDeleteComment = async (postId, commentId) => {
  const token = localStorage.getItem("token");

  try {
    await axios.delete(`${baseURL}/api/v1/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await axios.get(`${baseURL}/api/v1/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPosts(res.data.data);
  } catch (err) {
    console.error("Delete comment error:", err);
  }
};


//edit comment
const handleEditComment = async (e, postId, commentId) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  try {
    await axios.put(`${baseURL}/api/v1/comments/${commentId}`, 
      { text: editedText }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setEditingCommentId(null);
    setEditedText("");

    // Refresh post list
    const res = await axios.get(`${baseURL}/api/v1/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(res.data.data);
  } catch (err) {
    console.error("Edit comment error:", err);
  }
};

// follow/unfollow
  const handleFollowToggle = async (targetUserId, isFollowing) => {
  const token = localStorage.getItem("token");

  const url = `${baseURL}/api/v1/users/${targetUserId}/${isFollowing ? "unfollow" : "follow"}`;

  try {
    await axios.post(url, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Refresh user data after follow/unfollow
    const userRes = await axios.get(`${baseURL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(userRes.data.data);
  } catch (err) {
    console.error("Follow/Unfollow error:", err);
  }
};


//infinte scroll

const fetchMorePosts = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get(
      `${baseURL}/api/v1/posts?skip=${skip}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.data.data.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prev) => {
      const merged = [...prev, ...res.data.data];
      const uniqueMap = new Map();

      merged.forEach(post => {
    if (!uniqueMap.has(post._id)) {
      uniqueMap.set(post._id, post);
    }
      });

      return Array.from(uniqueMap.values());
    });

      setSkip(skip + limit);
    }
  } catch (err) {
    console.error("Error fetching more posts:", err);
  }
};



  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${baseURL}/api/v1/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
       console.log("Full userRes:", userRes.data.data);
        setUser(userRes.data.data );
        socket.connect();
        socket.emit("addUser", userRes.data.data._id);
        await fetchMorePosts();

      setMessage("");
      } catch (err) {
        console.error(" Failed to load user or posts Error:", err);
        setMessage("Session expired. Redirecting to login...");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
      }
    };

    fetchData();
  }, [navigate]);


  useEffect(() => {
  const handleScroll = () => {
    const scrollTop = window.innerHeight + window.scrollY;
    const fullHeight = document.documentElement.offsetHeight;

    if (scrollTop >= fullHeight - 100 && hasMore) {
      fetchMorePosts();
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [skip, hasMore]);



  if (!user) return <p>Loading user data...</p>;

  return (
    <div style={{ padding: "20px" }}>

      <h2>Home Feed</h2>

{/* my profile ----------------------------------------- */}
      <button
        onClick={() => navigate("/me")}
        style={{
          padding: "6px 12px",
          marginBottom: "10px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        My Profile
      </button>
      <Link to="/chat">
        <button style={{ marginBottom: "20px" }}>💬 Go to Chat</button>
      </Link>

{/* my profile ----------------------------------------- */}

      {message && <p>{message}</p>}
      {/* {user && (

            <div>
               <p>Logged in as: {user.username}</p>
               <Link to="/edit-profile">Edit Profile</Link>
            </div>
               
      )} */}

      {posts.length === 0 && !message && <p>No posts yet.</p>}

      {posts.map((post) => (
        <div key={String(post._id)} style={{ border: "1px solid #ccc", margin: "20px 0", padding: "10px" }}>
          <p>
            <strong>
              <Link to={`/users/${post.author?._id}`} style={{ textDecoration: "none", color: "black" }}>
                {post.author?.username || "Anonymous"}
              </Link>
            </strong>
          </p>


          <p>{post.caption}</p>

         
{/* neww may be removed----------------------------- */}
 
   


 {/* this too */}




{user && post.author && post.author._id && user._id !== post.author._id && (
  <button
    onClick={() =>
      handleFollowToggle(
        post.author._id,
        user.following?.includes(post.author._id)
      )
    }
    style={{
      marginBottom: "10px",
      padding: "5px 10px",
      fontSize: "14px",
      backgroundColor: user.following?.includes(post.author._id)
        ? "lightcoral"
        : "lightblue",
      border: "none",
      cursor: "pointer"
    }}
  >
    {user.following?.includes(post.author._id) ? "Unfollow" : "Follow"}
  </button>
)}





{/* new maybe removed--------------------------------- */}




          {post.mediaType === "image" && (
            <img src={post.mediaUrl} alt="post" style={{ maxWidth: "100%" }} />
          )}
          {post.mediaType === "video" && (
            <video controls style={{ maxWidth: "100%" }}>
              <source src={post.mediaUrl} />
              Your browser does not support the video tag.
            </video>
          )}

          <p>❤️ {post.likes.length} Likes</p>
            <p>💬 {post.comments.length} Comments</p>
            <button onClick={() => handleLike(post._id)}>❤️ Like</button>

            {/* Comment Form */}
            <form
              onSubmit={(e) => handleCommentSubmit(e, post._id)}
              style={{ marginTop: "10px" }}
            >
              <input
                type="text"
                name={`comment-${post._id}`}
                placeholder="Write a comment..."
                required
              />
              <button type="submit">💬 Comment</button>
            </form>

            {/* Comment List */}
           {post.comments.map((comment) => (
  <div key={String(comment._id)} style={{ marginLeft: "10px", fontStyle: "italic", marginBottom: "10px" }}>
    
    {/* If this comment is being edited */}
    {editingCommentId === comment._id ? (
      <form onSubmit={(e) => handleEditComment(e, post._id, comment._id)}>
        <input
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
        />
        <button type="submit">Save</button>
        <button type="button" onClick={() => setEditingCommentId(null)}>Cancel</button>
      </form>
    ) : (
      <>
        <div>
          <strong>{comment.author?.username ?? "Anon"}</strong>: {comment.text}
        </div>
        <div style={{ fontSize: "12px", color: "gray" }}>
          {new Date(comment.createdAt).toLocaleString()}
        </div>

        {/* Edit & Delete Buttons */}
        {user && comment.author?._id === user._id && (
          <>
            <button
              onClick={() => {
                setEditingCommentId(comment._id);
                setEditedText(comment.text);
              }}
              style={{ fontSize: "12px", color: "orange", marginRight: "5px" }}
            >
              Edit
            </button>

            <button
              onClick={() => handleDeleteComment(post._id, comment._id)}
              style={{ fontSize: "12px", color: "red" }}
            >
              Delete
            </button>
          </>
        )}
      </>
    )}
  </div>
))}


        </div>
      ))}
    </div>
  );
};

export default Home;
