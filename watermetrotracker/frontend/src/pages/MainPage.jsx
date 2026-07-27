
import React from 'react';
import Home from './Home';
import Terminals from './Terminals';
import LiveTracking from './LiveTracking';
import './MainPage.css';

const MainPage = () => {
  return (
    <div className="main-page">
      <section id="home"><Home /></section>
      <section id="terminals"><Terminals /></section>
      <section id="live-tracking"><LiveTracking /></section>
    </div>
  );
};

export default MainPage;
