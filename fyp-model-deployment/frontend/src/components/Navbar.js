import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import './NavBar.css'; // Import the CSS file
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { isLoggedIn, userRole, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout(); // Call logout function from context
  };

  // Handle redirection when Navbar.Brand is clicked
  const handleBrandClick = () => {
    if (isLoggedIn) {
      if (userRole === 'nurse') {
        navigate('/admission form'); // Redirect nurse to admission form
      } else if (userRole === 'admin') {
        navigate('/admin dashboard'); // Redirect admin to dashboard
      }
    } else {
      navigate('/'); // Redirect non-logged in user to the home page
    }
  };

  return (
    <Navbar variant="light" expand="lg" className="py-3 custom-navbar">
      <Navbar.Brand onClick={handleBrandClick} className="navbar-brand" style={{ cursor: 'pointer' }}>
        Hospital Occupancy Rate Prediction System
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className={`custom-nav`}>
          {!isLoggedIn ? (
            <>
              <Nav.Link as={NavLink} to="/" >
                Homepage
              </Nav.Link>
              <Nav.Link as={NavLink} to="/login">
                Staff Login
              </Nav.Link>
            </>
          ) : (
            <>
              {userRole === 'nurse' && (
                <>
                  <Nav.Link as={NavLink} to="/admission form">
                    Admission Form
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/checkout">
                    Checkout Patient
                  </Nav.Link>
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <Nav.Link as={NavLink} to="/admin dashboard">
                    Dashboard
                  </Nav.Link>
                </>
              )}
              <Nav.Link as={NavLink} to="/" onClick={handleLogout}>
                Logout
              </Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
