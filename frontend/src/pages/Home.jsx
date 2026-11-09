import './Home.css';
import { Typewriter } from 'react-simple-typewriter';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="typewriter-title">
        <Typewriter
          words={['Kochi Water Metro Live Tracker']}
          loop={false}
          cursor
          cursorStyle="|"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={1000}
        />
      </h1>
      <p>Track your water metro in real-time and explore terminals easily.</p>
    </div>
  );
};

export default Home;

