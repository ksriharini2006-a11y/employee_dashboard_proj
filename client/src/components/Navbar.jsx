import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <span className="brand"><span className="dot"></span>Employee Management System</span>
      <span className="user">
        {user.fullName}
        <button type="button" onClick={handleLogout}>Logout</button>
      </span>
    </nav>
  );
};

export default Navbar;