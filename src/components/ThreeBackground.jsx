import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

// The "Liquid Kernel" undulating orb
function LiquidKernel() {
  const meshRef = useRef();
  const [scrollY, setScrollY] = useState(0);

  // Track global scroll safely
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Rotate slowly
    meshRef.current.rotation.y = t * 0.1;
    meshRef.current.rotation.x = t * 0.05;
    
    // Calculate scroll offset (push orb up and scale it down slightly as user scrolls)
    const normalizedScroll = Math.min(scrollY / window.innerHeight, 1.5); 
    const targetY = (state.pointer.y * 0.5) + (normalizedScroll * 4); // Move up by up to 4 units
    const targetZ = (normalizedScroll * -2); // Push backwards slightly

    // React to mouse and scroll
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, state.pointer.x * 0.5, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.05);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.8, 64, 64]} />
      <MeshDistortMaterial
        color="#818cf8"
        emissive="#1e1b4b" // Much darker purple emissive to prevent blown out white centers
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.8}
        distort={0.4}
        speed={1.5}
        envMapIntensity={1} // Lowered so it doesn't look like a bright outdoor city
      />
    </mesh>
  );
}

export function ThreeBackground() {
  return (
    <div className="three-background-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: '#050505', pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true }}>
        {/* Deep, cinematic lighting */}
        <ambientLight intensity={0.1} color="#ffffff" />
        <directionalLight position={[5, 10, 5]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#4f46e5" />
        <spotLight position={[0, -5, 10]} intensity={2} angle={0.5} penumbra={1} color="#c084fc" />
        
        {/* Abstract studio reflection instead of city */}
        <Environment preset="studio" />
        
        <Sparkles count={150} scale={18} size={1} speed={0.2} opacity={0.4} color="#a5b4fc" />

        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <LiquidKernel />
        </Float>

        {/* Muted Bloom to maintain text legibility */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.4} 
            luminanceSmoothing={0.9} 
            intensity={0.8} 
            mipmapBlur
          />
        </EffectComposer>
        
        <fog attach="fog" args={['#050505', 5, 25]} />
      </Canvas>
    </div>
  );
}
