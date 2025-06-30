import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Navbar.css";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [notFound, setNotFound] = useState(false);
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);


    useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.data);
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };
    fetchUser();
  }, []);

     const handleSearch = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.get(`${baseURL}/api/v1/users/search?query=${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const users = res.data.data;

    if (users.length > 0) {
      navigate(`/users/${users[0]._id}`);
      setQuery("");
    } else {
      setNotFound(true);
      setTimeout(() => setNotFound(false), 3000); // Clear message after 3 sec
    }
  } catch (err) {
    console.error("Search error:", err);
    setNotFound(true);
    setTimeout(() => setNotFound(false), 3000);
  }
};

     const handleLogout = () => {
          const confirmLogout = window.confirm("Are you sure you want to logout?");
          if (confirmLogout) {
              localStorage.removeItem("token");
              navigate("/login");
          }
      };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-title">FriendBook</Link>
      </div>
      <div className="searchMsge">
      <form onSubmit={handleSearch} className="nav-search-form">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label htmlFor="">Search</label>
      </form>
      {notFound && (
        <div style={{
          color: "red",
          fontSize: "14px",
          marginTop: "4px",
          position: "absolute",
          top: "100%",
          left: "0"
        }}>
          No user found
        </div>
      )}
      </div>

      <div className="nav-center">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/chat" className="nav-link">Messages</Link>
        <Link to="/create-post" className="nav-create-post">Create Post</Link>
        </div>
        <div className="nav-right">
          {user && (
          <Link to="/me" className="nav-user-info">
            <img
              src={user.profilePic || "/default-profile.png"}
              alt="Profile"
              className="nav-profile-pic"
            />
            <span className="nav-username">{user.username}</span>
          </Link>
        )}
        {localStorage.getItem("token") && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </div>
      
    </nav>
  );
};

export default Navbar;
