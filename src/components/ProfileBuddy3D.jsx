import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

function CartoonBuddy({ gesture, setGesture, mouse }) {
  const group = useRef()
  const head = useRef()
  const body = useRef()
  const leftArm = useRef()
  const rightArm = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const antenna = useRef()
  const eyeL = useRef()
  const eyeR = useRef()
  const mouth = useRef()

  const blinkRef = useRef({ t: 0, next: 2 + Math.random() * 3 })

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (!group.current) return

    // idle bob + breathe
    group.current.position.y = Math.sin(t * 1.1) * 0.12
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, mouse.current.x * 0.35, 0.06)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -mouse.current.y * 0.2, 0.06)

    if (body.current) {
      body.current.scale.y = 1 + Math.sin(t * 1.6) * 0.03
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.7) * 0.15
      head.current.position.y = 1.35 + Math.sin(t * 1.2) * 0.04
      // nod when gesture is nod
      if (gesture === 'nod') head.current.rotation.x = Math.sin(t * 8) * 0.35
      else head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, 0, 0.1)
    }
    if (antenna.current) {
      antenna.current.rotation.z = Math.sin(t * 2) * 0.15
    }

    // eye blink
    blinkRef.current.t += delta
    if (blinkRef.current.t > blinkRef.current.next) {
      blinkRef.current.t = 0
      blinkRef.current.next = 2 + Math.random() * 4
      if (eyeL.current && eyeR.current) {
        eyeL.current.scale.y = 0.1
        eyeR.current.scale.y = 0.1
        setTimeout(() => {
          if (eyeL.current) eyeL.current.scale.y = 1
          if (eyeR.current) eyeR.current.scale.y = 1
        }, 120)
      }
    }

    // gestures
    const wave = gesture === 'wave'
    const point = gesture === 'point'
    const think = gesture === 'think'
    const dance = gesture === 'dance'
    const excited = gesture === 'excited'

    if (rightArm.current) {
      if (wave) rightArm.current.rotation.z = -0.3 + Math.sin(t * 7) * 0.9
      else if (point) rightArm.current.rotation.z = -1.2
      else if (think) rightArm.current.rotation.z = -2.1
      else if (dance) rightArm.current.rotation.z = Math.sin(t * 5) * 1.1 - 0.5
      else rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, -0.5, 0.1)
      if (wave || dance) rightArm.current.rotation.x = Math.sin(t * 7) * 0.3
    }
    if (leftArm.current) {
      if (dance) leftArm.current.rotation.z = Math.sin(t * 5 + 1) * 1.1 + 0.5
      else if (excited) leftArm.current.rotation.z = 0.8 + Math.sin(t * 9) * 0.5
      else leftArm.current.rotation.z = THREE.MathUtils.lerp(leftArm.current.rotation.z, 0.5, 0.1)
    }
    if (leftLeg.current && rightLeg.current) {
      if (dance) {
        leftLeg.current.rotation.x = Math.sin(t * 6) * 0.6
        rightLeg.current.rotation.x = Math.sin(t * 6 + Math.PI) * 0.6
        group.current.position.y += Math.abs(Math.sin(t * 6)) * 0.06
      } else {
        leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, 0.1)
        rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, 0.1)
      }
    }
    if (mouth.current) {
      if (gesture === 'talk' || gesture === 'wave') mouth.current.scale.y = 1 + Math.sin(t * 12) * 0.5
      else mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 1, 0.1)
    }
  })

  return (
    <group ref={group} position={[0, -0.35, 0]} scale={1.18} onPointerOver={() => setGesture('wave')} onPointerOut={() => setGesture('idle')}>
      {/* shadow */}
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} />
      </mesh>

      {/* body */}
      <group ref={body} position={[0, 0.35, 0]}>
        <mesh>
          <capsuleGeometry args={[0.42, 0.55, 8, 16]} />
          <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.25} roughness={0.45} />
        </mesh>
        {/* belly light */}
        <mesh position={[0, -0.05, 0.32]}>
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial color="#fefefe" emissive="#fefefe" emissiveIntensity={0.35} />
        </mesh>
        {/* chest button */}
        <mesh position={[0, 0.18, 0.38]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.35, 0]}>
        <mesh>
          <sphereGeometry args={[0.52, 24, 24]} />
          <meshStandardMaterial color="#ffd6a8" roughness={0.5} />
        </mesh>
        {/* blush */}
        <mesh position={[-0.22, -0.12, 0.42]}>
          <circleGeometry args={[0.09, 12]} />
          <meshBasicMaterial color="#f472b6" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0.22, -0.12, 0.42]}>
          <circleGeometry args={[0.09, 12]} />
          <meshBasicMaterial color="#f472b6" transparent opacity={0.35} />
        </mesh>
        {/* eyes */}
        <group position={[0, 0.12, 0.44]}>
          <mesh ref={eyeL} position={[-0.18, 0, 0]} scale={[1, 1, 1]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[-0.18, 0, 0.07]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#1e1b4b" />
          </mesh>
          <mesh position={[-0.16, 0.04, 0.09]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <mesh ref={eyeR} position={[0.18, 0, 0]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0.18, 0, 0.07]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#1e1b4b" />
          </mesh>
          <mesh position={[0.2, 0.04, 0.09]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
        </group>
        {/* glasses */}
        <mesh position={[0, 0.12, 0.52]}>
          <torusGeometry args={[0.14, 0.015, 8, 20]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[-0.18, 0.12, 0.52]}>
          <torusGeometry args={[0.14, 0.015, 8, 20]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[0, 0.12, 0.52]}>
          <boxGeometry args={[0.08, 0.01, 0.01]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        {/* mouth */}
        <mesh ref={mouth} position={[0, -0.18, 0.47]}>
          <capsuleGeometry args={[0.04, 0.09, 4, 8]} />
          <meshStandardMaterial color="#7c2d12" />
        </mesh>
        {/* antenna */}
        <group ref={antenna} position={[0, 0.52, 0]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
            <meshStandardMaterial color="#a78bfa" />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[0, 0.36, 0]} intensity={6} distance={1.2} color="#22d3ee" />
        </group>
        {/* hair tuft */}
        <mesh position={[0, 0.45, -0.05]} rotation={[0.6, 0, 0]}>
          <capsuleGeometry args={[0.07, 0.2, 4, 8]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
      </group>

      {/* arms */}
      <group ref={leftArm} position={[-0.46, 0.55, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.09, 0.42, 6, 10]} />
          <meshStandardMaterial color="#ffd6a8" />
        </mesh>
        <mesh position={[0, -0.54, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#ffd6a8" />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.46, 0.55, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.09, 0.42, 6, 10]} />
          <meshStandardMaterial color="#ffd6a8" />
        </mesh>
        <mesh position={[0, -0.54, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#ffd6a8" />
        </mesh>
      </group>

      {/* legs */}
      <group ref={leftLeg} position={[-0.18, -0.45, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.11, 0.32, 6, 8]} />
          <meshStandardMaterial color="#4c1d95" />
        </mesh>
        <mesh position={[0, -0.45, 0.05]}>
          <sphereGeometry args={[0.13, 10, 10]} />
          <meshStandardMaterial color="#22d3ee" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.18, -0.45, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.11, 0.32, 6, 8]} />
          <meshStandardMaterial color="#4c1d95" />
        </mesh>
        <mesh position={[0, -0.45, 0.05]}>
          <sphereGeometry args={[0.13, 10, 10]} />
          <meshStandardMaterial color="#22d3ee" />
        </mesh>
      </group>
    </group>
  )
}

export default function ProfileBuddy3D({ stats, tier, user }) {
  const [gesture, setGesture] = useState('wave')
  const [idx, setIdx] = useState(0)
  const mouse = useRef({ x: 0, y: 0 })

  const messages = useMemo(() => {
    const name = user.name.split(' ')[0]
    const msgs = []
    msgs.push({ text: `Hey ${name}! I'm Vizzy — your code buddy! 👋`, gesture: 'wave', emoji: '🤖' })
    if (stats.total === 0) msgs.push({ text: `First solve unlocks my epic dance! Let's gooo! 🕺`, gesture: 'dance', emoji: '✨' })
    else msgs.push({ text: `${stats.total} solves?! You're on fire! 🔥`, gesture: 'excited', emoji: '🚀' })
    if (stats.streak === 0) msgs.push({ text: `Streak is 0... tap Start playing and I'll cheer you!`, gesture: 'point', emoji: '👉' })
    else msgs.push({ text: `${stats.streak} day streak! I'm so proud 🥹`, gesture: 'nod', emoji: '💜' })
    if (stats.accuracy < 60 && stats.total > 0) msgs.push({ text: `Accuracy ${stats.accuracy}% — I'll help you check edge cases! 🤓`, gesture: 'think', emoji: '🧠' })
    if (stats.hardSolved === 0) msgs.push({ text: `No Hard yet? Scary but we got this together! 😤`, gesture: 'excited', emoji: '💪' })
    if (stats.tier.name === 'Legend') msgs.push({ text: `LEGEND!! Teach me senpai! 🙇`, gesture: 'nod', emoji: '👑' })
    else msgs.push({ text: `${stats.tier.next - stats.rating} pts to ${tier.next ? tier.next : 'max'} — let's grind!`, gesture: 'point', emoji: '🎯' })
    // add tips
    stats.tips.forEach((t) => msgs.push({ text: t, gesture: 'think', emoji: '💡' }))
    msgs.push({ text: `Click me for a joke: Why do coders love dark mode? Lights off, bugs off! 😂`, gesture: 'wave', emoji: '😆' })
    msgs.push({ text: `Pro tip: Hover me — I wave! Click me — I talk!`, gesture: 'wave', emoji: '👋' })
    return msgs
  }, [stats, tier, user])

  useEffect(() => {
    // initial wave then idle
    const t1 = setTimeout(() => setGesture('idle'), 2200)
    // auto cycle messages
    const iv = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % messages.length
        setGesture(messages[next].gesture)
        setTimeout(() => setGesture('idle'), 2200)
        return next
      })
    }, 6500)
    return () => { clearTimeout(t1); clearInterval(iv) }
  }, [messages])

  const current = messages[idx]

  useEffect(() => {
    setGesture(current.gesture)
    const t = setTimeout(() => setGesture('idle'), 1800)
    return () => clearTimeout(t)
  }, [idx, current.gesture])

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }

  const [has3D, setHas3D] = useState(true)
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setHas3D(false)
    } catch { setHas3D(false) }
  }, [])

  if (!has3D) {
    return (
      <div className="buddy-card" onPointerMove={handlePointerMove}>
        <div className="buddy-header">
          <span className="buddy-title">Meet Vizzy</span>
          <span className="buddy-sub">your profile buddy • only here</span>
        </div>
        <div className="buddy-canvas-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }} onClick={() => setIdx((i) => (i + 1) % messages.length)}>
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ fontSize: '5rem' }}>🤖</motion.div>
          <div className="buddy-bubble" style={{ position: 'relative', left: 'auto', bottom: 'auto', transform: 'none', maxWidth: '86%' }}>
            <span className="buddy-emoji">{current.emoji}</span>
            <p>{current.text}</p>
          </div>
        </div>
        <div className="buddy-controls">
          <div className="buddy-dots">
            {messages.map((_, i) => (
              <button key={i} className={`buddy-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} aria-label={`tip ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="buddy-card" onPointerMove={handlePointerMove}>
      <div className="buddy-header">
        <span className="buddy-title">Meet Vizzy</span>
        <span className="buddy-sub">your 3D profile buddy • only here</span>
      </div>

      <div className="buddy-canvas-wrap" onClick={() => { setIdx((i) => (i + 1) % messages.length) }}>
        <Canvas
          camera={{ position: [0, 0.6, 2.9], fov: 42 }}
          dpr={[1, 1.25]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
          onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
        >
          <color attach="background" args={['transparent']} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[2, 4, 2]} intensity={1.4} color="#fff" />
          <pointLight position={[-2, 2, 2]} intensity={18} color="#a78bfa" distance={4} />
          <pointLight position={[2, 1.5, 2]} intensity={14} color="#22d3ee" distance={4} />
          <CartoonBuddy gesture={gesture} setGesture={setGesture} mouse={mouse} />
          {/* floating sparkles */}
          <mesh position={[0.9, 0.8, 0]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} /></mesh>
          <mesh position={[-0.9, 0.6, 0]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={1} /></mesh>
        </Canvas>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            className="buddy-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <span className="buddy-emoji">{current.emoji}</span>
            <p>{current.text}</p>
            <span className="buddy-tail" />
          </motion.div>
        </AnimatePresence>

        <motion.div className="buddy-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          👆 click Vizzy • hover to wave
        </motion.div>
      </div>

      <div className="buddy-controls">
        <div className="buddy-gestures">
          {[
            { k: 'wave', l: '👋 Wave', g: 'wave' },
            { k: 'dance', l: '🕺 Dance', g: 'dance' },
            { k: 'think', l: '🤔 Think', g: 'think' },
            { k: 'point', l: '👉 Point', g: 'point' },
            { k: 'nod', l: '😊 Nod', g: 'nod' },
          ].map((b) => (
            <button key={b.k} className={`buddy-btn ${gesture === b.g ? 'active' : ''}`} onClick={() => { setGesture(b.g); setTimeout(() => setGesture('idle'), 1600) }}>
              {b.l}
            </button>
          ))}
        </div>
        <div className="buddy-dots">
          {messages.map((_, i) => (
            <button key={i} className={`buddy-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} aria-label={`tip ${i + 1}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
