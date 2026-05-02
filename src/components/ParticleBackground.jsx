import React from 'react';
import { Particles as ReactParticles } from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const ParticleBackground = () => {
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  const particlesOptions = {
    background: {
      color: {
        value: '#0d0d25',
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'trail',
        },
        resize: true,
      },
      modes: {
        trail: {
          delay: 0.005,
          quantity: 2,
        },
      },
    },
    particles: {
      color: {
        value: '#ffffff',
      },
      number: {
        value: 80,
      },
      opacity: {
        value: 0.8,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 3 },
      },
      move: {
        enable: true,
        speed: 0.2,
        direction: 'none',
        random: true,
        outModes: {
          default: 'out',
        },
      },
    },
    detectRetina: true,
  };

  return (
    <ReactParticles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
    />
  );
};

export default ParticleBackground;
