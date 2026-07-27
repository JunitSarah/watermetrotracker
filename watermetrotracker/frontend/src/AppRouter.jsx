import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Terminals from './pages/Terminals';
import LiveTracking from './pages/LiveTracking';

const AppRouter = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/terminals" element={<Terminals />} />
      <Route path="/live-tracking" element={<LiveTracking />} />
    </Routes>
  </Router>
);

export default AppRouter;