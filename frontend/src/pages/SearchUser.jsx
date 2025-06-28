import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const SearchUser = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const token = localStorage.getItem("token");

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.get(`${baseURL}/api/v1/users/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(res.data.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search Users</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by username or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />
        <button type="submit" style={{ padding: "8px 12px", marginLeft: "10px" }}>Search</button>
      </form>

      <div style={{ marginTop: "20px" }}>
        {results.map((user) => (
          <div key={user._id} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
            <img
              src={user.profilePic || "https://via.placeholder.com/40"}
              alt={user.username}
              style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
            />
            <Link to={`/users/${user._id}`} style={{ textDecoration: "none", color: "blue" }}>
              {user.username}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchUser;
