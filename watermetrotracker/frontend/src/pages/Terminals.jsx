
import './Terminals.css';
import { useRef } from 'react';

import vypin from '../assets/vypin.png';
import vyttila from '../assets/vyttila.png';
import southchittoor from '../assets/southchittoor.png';
import highcourt from '../assets/highcourt.png';
import kakkanad from '../assets/kakkanad.png';
import eloor from '../assets/eloor.png';
import cheranalloor from '../assets/cheranalloor.png';
import fortkochi from '../assets/fortkochi.png';

const terminals = [
  { name: 'Vypin', image: vypin },
  { name: 'Vyttila', image: vyttila },
  { name: 'South Chittoor', image: southchittoor },
  { name: 'High Court', image: highcourt },
  { name: 'Kakkanad', image: kakkanad },
  { name: 'Eloor', image: eloor },
  { name: 'Cheranalloor', image: cheranalloor },
  { name: 'Fort Kochi', image: fortkochi },
];

const Terminals = () => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="terminals-container">
      <h2>Our Terminals</h2>
      <div className="scroll-buttons">
        <button onClick={scrollLeft} className="scroll-btn left">‹</button>
        <div className="terminal-strip" ref={scrollRef}>
          {terminals.map((terminal, index) => (
            <div className="terminal-card" key={index}>
              <img src={terminal.image} alt={terminal.name} />
              <p>{terminal.name}</p>
            </div>
          ))}
        </div>
        <button onClick={scrollRight} className="scroll-btn right">›</button>
      </div>
    </div>
  );
};

export default Terminals;

