import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import "../styles/AuthPage.css"; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/"); // Redirect to home or dashboard
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {isLogin ? (
          <>
            <Login onSuccess={handleAuthSuccess} />
            <p>
              Don't have an account?{" "}
              <button className="link-btn" onClick={() => setIsLogin(false)}>
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <Register onSuccess={handleAuthSuccess} />
            <p>
              Already have an account?{" "}
              <button className="link-btn" onClick={() => setIsLogin(true)}>
                Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
