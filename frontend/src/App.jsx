import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import Navbar from './pages/Navbar';
import AuthPage from './pages/AuthPage';
import {useLocation} from 'react-router-dom';
import SearchUser from "./pages/SearchUser";


const AppRoutes = () => {
  const location = useLocation();

  // Do NOT show Navbar on auth page
  const hideNavbar = location.pathname === '/auth';

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/me" element={<MyProfile />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/search" element={<SearchUser />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
