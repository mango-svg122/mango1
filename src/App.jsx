import React from 'react';
import ParticleBackground from './components/ParticleBackground';
import Moon from './components/Moon';

const App = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ParticleBackground />
      <Moon />
    </div>
  );
};

export default App;
