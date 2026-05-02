import React from 'react';
import StarField from './components/StarField';
import Meteors from './components/Meteors';
import ParticleTrail from './components/ParticleTrail';
import Moon from './components/Moon';

const App = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <StarField />
      <Meteors />
      <ParticleTrail />
      <Moon />
    </div>
  );
};

export default App;