
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
