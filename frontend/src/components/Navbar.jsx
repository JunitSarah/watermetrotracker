
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={require('../assets/watermetro-logo.png')} alt="Logo" className="logo" />
        <div className="navbar-title">Kochi Water Metro</div>
      </div>
      <ul className="navbar-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#terminals">Terminals</a></li>
        <li><a href="#live-tracking">Live Tracking</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
