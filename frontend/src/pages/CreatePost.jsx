import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const baseURL = import.meta.env.VITE_API_BASE_URL;


const CreatePost = () => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption || !file) return setMessage("Caption and file are required");

    try {
      setMessage("Uploading file...");

      // Upload to Cloudinary
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(`${baseURL}/api/v1/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const mediaUrl = uploadRes.data.url;
      const mediaType = file.type.startsWith("image") ? "image" : "video";

      setMessage("Creating post...");

      // Create the post
      const postRes = await axios.post(
        `${baseURL}/api/v1/posts`,
        { caption, mediaUrl, mediaType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Post created:", postRes.data);
      setMessage("Post created successfully!");
      setTimeout(() => navigate("/"), 500);
      setCaption("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Post creation failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          required
        /><br /><br />

        <input type="file" onChange={handleFileChange} required /><br /><br />

        <button type="submit">Post</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default CreatePost;
