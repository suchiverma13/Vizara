import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'

function Trophy({ color, emissive }) {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.9
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.3
  })
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.55}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 0.95, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.35}
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

export default function Verdict3D({ win }) {
  return (
    <div className="verdict-3d">
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight
          position={[3, 3, 3]}
          intensity={30}
          color={win ? '#34d399' : '#f87171'}
        />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1.6}>
          <Trophy color={win ? '#34d399' : '#f87171'} emissive={win ? '#10b981' : '#ef4444'} />
        </Float>
        <Sparkles count={35} scale={5} size={2.2} speed={0.6} color={win ? '#34d399' : '#f87171'} />
      </Canvas>
    </div>
  )
}