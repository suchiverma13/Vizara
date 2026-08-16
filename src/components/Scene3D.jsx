import { Component, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

class SceneBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
  g.addColorStop(0.35, 'rgba(167, 139, 250, 0.4)')
  g.addColorStop(1, 'rgba(167, 139, 250, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

const GLOW = makeGlowTexture()

function Nebula({ position, scale, color, speed }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * speed) * 0.12
    ref.current.rotation.z = state.clock.elapsedTime * speed * 0.04
  })
  return (
    <sprite ref={ref} position={position} scale={scale}>
      <spriteMaterial
        map={GLOW}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        color={color}
      />
    </sprite>
  )
}

function Planet() {
  const body = useRef()
  const ring = useRef()
  useFrame((state, delta) => {
    body.current.rotation.y += delta * 0.07
    ring.current.rotation.z = 0.42 + Math.sin(state.clock.elapsedTime * 0.2) * 0.04
  })
  return (
    <group position={[5.6, 1.4, -6]}>
      <mesh ref={body}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#6d28d9"
          emissiveIntensity={0.55}
          roughness={0.4}
          metalness={0.25}
        />
      </mesh>
      <mesh ref={ring} rotation={[1.25, 0.3, 0]}>
        <torusGeometry args={[3.15, 0.55, 16, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={0.55}
          transparent
          opacity={0.75}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      <Moon dist={4.2} speed={0.5} size={0.35} />
    </group>
  )
}

function Moon({ dist, speed, size }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    ref.current.position.set(Math.cos(t) * dist, Math.sin(t * 0.7) * dist * 0.35, Math.sin(t) * dist)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 20, 20]} />
      <meshStandardMaterial color="#c4b5fd" emissive="#a78bfa" emissiveIntensity={0.35} />
    </mesh>
  )
}

function DwarfPlanet() {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.1
    ref.current.position.y = -1.6 + Math.sin(state.clock.elapsedTime * 0.3) * 0.25
  })
  return (
    <mesh ref={ref} position={[-6.8, -1.6, -7]}>
      <sphereGeometry args={[1.35, 36, 36]} />
      <meshStandardMaterial
        color="#fb923c"
        emissive="#ea580c"
        emissiveIntensity={0.45}
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>
  )
}

function Asteroid({ position, scale, speed }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speed
    ref.current.rotation.y += delta * speed * 0.8
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#4c4a6b" roughness={1} flatShading />
    </mesh>
  )
}

function ShootingStar() {
  const ref = useRef()
  const d = useRef({ t: 0, x: 10, y: 5 })
  useFrame((state, delta) => {
    d.current.t += delta
    if (d.current.t > 2.6) {
      d.current.t = 0
      d.current.x = 8 + Math.random() * 6
      d.current.y = 4 + Math.random() * 3
    }
    const prog = d.current.t / 2.6
    ref.current.position.set(d.current.x - prog * 17, d.current.y - prog * 6.5, 2.5)
    ref.current.material.opacity = Math.sin(prog * Math.PI) * 0.9
  })
  return (
    <mesh ref={ref} rotation={[0, 0, 0.35]}>
      <planeGeometry args={[2.4, 0.05]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function Debris({ position, geometry, color }) {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 0.25
    ref.current.rotation.y += delta * 0.35
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.3
  })
  return (
    <mesh ref={ref} position={position}>
      {geometry}
      <meshStandardMaterial
        color={color}
        wireframe
        emissive={color}
        emissiveIntensity={0.35}
        roughness={0.2}
        metalness={0.6}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

function CameraRig() {
  const { camera, pointer } = useThree()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.4, 0.04)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.4 + pointer.y * 0.8 + Math.sin(t * 0.25) * 0.3, 0.04)
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

export default function Scene3D() {
  return (
    <SceneBoundary>
      <div className="scene3d" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0.4, 8.5], fov: 55 }}
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true }}
        >
          <fog attach="fog" args={['#0a0620', 10, 26]} />
          <ambientLight intensity={0.45} color="#a78bfa" />
          <directionalLight position={[2, 6, 5]} intensity={1.1} color="#e0d4ff" />
          <pointLight position={[5, 3, 4]} intensity={40} color="#7c3aed" />
          <pointLight position={[-6, -2, 3]} intensity={22} color="#22d3ee" />
          <CameraRig />
          <Nebula position={[-6, 2.5, -8]} scale={[9, 6, 1]} color="#7c3aed" speed={0.3} />
          <Nebula position={[6.5, -2, -9]} scale={[8, 5, 1]} color="#22d3ee" speed={0.25} />
          <Nebula position={[0, 4.5, -10]} scale={[7, 5, 1]} color="#f472b6" speed={0.2} />
          <Planet />
          <DwarfPlanet />
          <Moon dist={2.6} speed={0.9} size={0.22} />
          <Asteroid position={[2.2, 3.4, -3]} scale={[0.5, 0.4, 0.5]} speed={0.5} />
          <Asteroid position={[-3.4, 3.2, -4]} scale={[0.4, 0.5, 0.45]} speed={0.7} />
          <Asteroid position={[-2, -3.2, -2]} scale={[0.55, 0.45, 0.5]} speed={0.35} />
          <Asteroid position={[4.5, -3, -5]} scale={[0.45, 0.4, 0.55]} speed={0.6} />
          <Asteroid position={[1.5, -2.6, -1.5]} scale={[0.3, 0.35, 0.3]} speed={0.8} />
          <Asteroid position={[-5.5, 1.5, -2]} scale={[0.35, 0.3, 0.4]} speed={0.45} />
          <ShootingStar />
          <Debris position={[-4.2, 2.4, -3]} geometry={<torusKnotGeometry args={[0.55, 0.18, 64, 8]} />} color="#f472b6" />
          <Debris position={[3.8, 2.8, -4]} geometry={<octahedronGeometry args={[0.8]} />} color="#22d3ee" />
          <Debris position={[-2.6, -1.2, -5]} geometry={<torusGeometry args={[0.7, 0.24, 16, 32]} />} color="#a3e635" />
          <Debris position={[4.6, -1.4, -2.5]} geometry={<icosahedronGeometry args={[0.6]} />} color="#a78bfa" />
          <Stars radius={90} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          <Stars radius={40} depth={30} count={800} factor={6} saturation={0.8} fade speed={0.6} />
          <Sparkles count={80} scale={16} size={2} speed={0.4} color="#a78bfa" />
        </Canvas>
      </div>
    </SceneBoundary>
  )
}