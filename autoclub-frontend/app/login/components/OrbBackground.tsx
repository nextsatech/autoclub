'use client';

import Orb from './Orb';

export default function OrbBackground() {
  return (
    // CAMBIO CLAVE: Quitamos 'pointer-events-none' para que detecte el mouse
    // Agregamos 'fixed' para que cubra todo sin importar el scroll en móviles
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