import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { socket } from "../utils/socket";
import "../styles/Home.css";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? "s" : ""} ago`;

  return "Just now";
};


const Home = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [message, setMessage] = useState("Loading...");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [showComments, setShowComments] = useState({});


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

//------------------DELETE A POST-------------------
const handleDeletePost = async (postId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this post?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");

  try {
    await axios.delete(`${baseURL}/api/v1/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  } catch (err) {
    console.error("Error deleting post:", err);
  }
};


//------------------DELETE A POST-------------------


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

//toggle comment
const toggleComments = (postId) => {
  setShowComments((prev) => ({
    ...prev,
    [postId]: !prev[postId],
  }));
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
      navigate("/auth");
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
    <div className="home-container">
    <h2 className="home-heading">Home Feed</h2>


{/* my profile ----------------------------------------- */}
      {/* <Link to="/me" className="home-profile-link">
        <img
          src={user?.profilePic || "/default-profile.png"}
          alt="Profile"
          className="home-profile-pic"
        />
        <span>{user?.username}</span>
      </Link> */}

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
        <div key={String(post._id)} className="post-card">
          <p className="post-author">
            <strong>
              <Link to={`/users/${post.author?._id}`} style={{ textDecoration: "none", color: "black" }} className="post-author-info">
                
                  <img
                    src={post.author?.profilePic || "/default-profile.png"}
                    alt="Profile"
                  />
                  <span>
                  <strong>
                    
                      {post.author?.username || "Anonymous"}
                    
                  </strong>
                  </span>
                
              </Link>
            </strong>
          </p>


          <p className="post-caption">{post.caption}</p>

         <p style={{ fontSize: "12px", color: "gray" }}>
          Posted {timeAgo(post.createdAt)}
        </p>


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
{post.author._id === user._id && (
  <button onClick={() => handleDeletePost(post._id)} style={{ color: "red", marginTop: "5px" }}>
    Delete Post
  </button>
)}


{/* new maybe removed--------------------------------- */}


          {post.mediaType === "image" && (
            <img src={post.mediaUrl} alt="post" className="post-media" />
          )}
          {post.mediaType === "video" && (
            <video controls className="post-media">
              <source src={post.mediaUrl} />
              Your browser does not support the video tag.
            </video>
          )}

          <p className="likeNum">❤️ {post.likes.length} Likes</p>
            <p className="cmntNum">💬 {post.comments.length} Comments</p>
            <div className="post-action">
              <button onClick={() => handleLike(post._id)}>❤️ Like</button>
            </div>

            <button onClick={() => toggleComments(post._id)}>
              {showComments[post._id] ? "Hide Comments" : "Show Comments"}
            </button>

            {/* Comment Form */}
            <form
              onSubmit={(e) => handleCommentSubmit(e, post._id)}
              className="comment-form"
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
           {showComments[post._id] && post.comments.map((comment) => (
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
        <div key={comment._id} className="comment">
          <strong>{comment.author?.username ?? "Anon"}</strong>: {comment.text}
          <small>{new Date(comment.createdAt).toLocaleString()}</small>

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
        </div>

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
