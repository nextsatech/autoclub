'use client';

import Orb from './Orb';

export default function OrbBackground() {
  return (
    
    <div className="fixed inset-0 z-0">
      <Orb
        hoverIntensity={0.5}
        rotateOnHover={true}
        hue={0}
        forceHoverState={false}
        backgroundColor="#000000"
      />
    </div>
  );
}