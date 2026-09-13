import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

function RedHairGirl({ gesture, mouse }) {
  const group = useRef()
  const head = useRef()
  const hairTop = useRef()
  const hairBack = useRef()
  const waveL = useRef()
  const waveR = useRef()
  const body = useRef()
  const leftArm = useRef()
  const rightArm = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const eyeL = useRef()
  const eyeR = useRef()
  const mouth = useRef()
  const dress = useRef()

  const blink = useRef({ t: 0, next: 2.5 + Math.random() * 2 })

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (!group.current) return

    // Hover drift left-right with smooth ease in-out (sine ease) + gentle bob
    const driftX = Math.sin(t * 0.38) * 0.95
    const easeDrift = THREE.MathUtils.smoothstep(driftX, -0.95, 0.95) // just to keep ease feel, actually sin already ease
    group.current.position.x = driftX
    group.current.position.y = Math.sin(t * 1.15) * 0.18 + 0.12 + Math.abs(Math.sin(t * 0.42)) * 0.04
    // turning slightly to greet viewer (y rotation follows drift + mouse)
    const greetTurn = Math.sin(t * 0.45) * 0.42
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, greetTurn + mouse.current.x * 0.3, 0.05)
    group.current.rotation.z = Math.sin(t * 0.35) * 0.07
    // gentle mid-air spin burst when dance
    if (gesture === 'dance') group.current.rotation.y += delta * 1.2
    if (gesture === 'spin') group.current.rotation.y += delta * 2.4

    if (body.current) {
      body.current.rotation.z = Math.sin(t * 0.9) * 0.04
      body.current.scale.y = 1 + Math.sin(t * 1.7) * 0.02
    }
    if (dress.current) {
      dress.current.rotation.z = Math.sin(t * 1.1) * 0.05
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.75) * 0.18
      head.current.position.y = 1.38 + Math.sin(t * 1.3) * 0.03
      if (gesture === 'nod') head.current.rotation.x = Math.sin(t * 7) * 0.38
      else head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, Math.sin(t * 0.6) * 0.05, 0.1)
      if (gesture === 'greet') head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, 0.45, 0.1)
    }
    if (hairTop.current) hairTop.current.rotation.z = Math.sin(t * 0.8) * 0.04
    if (hairBack.current) {
      hairBack.current.position.y = -0.08 + Math.sin(t * 1.0) * 0.03
      hairBack.current.rotation.x = Math.sin(t * 0.7) * 0.06
    }
    if (waveL.current) waveL.current.rotation.z = Math.sin(t * 1.2) * 0.12
    if (waveR.current) waveR.current.rotation.z = Math.sin(t * 1.2 + 1) * 0.12

    // blink
    blink.current.t += delta
    if (blink.current.t > blink.current.next) {
      blink.current.t = 0
      blink.current.next = 2 + Math.random() * 3.5
      if (eyeL.current && eyeR.current) {
        eyeL.current.scale.y = 0.12
        eyeR.current.scale.y = 0.12
        setTimeout(() => {
          if (eyeL.current) eyeL.current.scale.y = 1
          if (eyeR.current) eyeR.current.scale.y = 1
        }, 110)
      }
    }

    // gestures
    if (rightArm.current) {
      if (gesture === 'wave') {
        rightArm.current.rotation.z = -0.6 + Math.sin(t * 7.5) * 0.95
        rightArm.current.rotation.x = Math.sin(t * 7.5) * 0.25
      } else if (gesture === 'greet') {
        rightArm.current.rotation.z = -1.0
        rightArm.current.rotation.x = 0.2
      } else if (gesture === 'point') rightArm.current.rotation.z = -1.35
      else if (gesture === 'think') rightArm.current.rotation.z = -2.0
      else if (gesture === 'dance') rightArm.current.rotation.z = Math.sin(t * 5.5) * 1.0 - 0.4
      else rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, -0.45, 0.1)
    }
    if (leftArm.current) {
      if (gesture === 'dance') leftArm.current.rotation.z = Math.sin(t * 5.5 + 1) * 1.0 + 0.45
      else if (gesture === 'wave') leftArm.current.rotation.z = THREE.MathUtils.lerp(leftArm.current.rotation.z, 0.5, 0.08)
      else leftArm.current.rotation.z = THREE.MathUtils.lerp(leftArm.current.rotation.z, 0.45, 0.1)
    }
    if (leftLeg.current && rightLeg.current) {
      if (gesture === 'dance') {
        leftLeg.current.rotation.x = Math.sin(t * 6.5) * 0.55
        rightLeg.current.rotation.x = Math.sin(t * 6.5 + Math.PI) * 0.55
      } else {
        // hover leg dangle
        leftLeg.current.rotation.x = Math.sin(t * 1.4) * 0.18
        rightLeg.current.rotation.x = Math.sin(t * 1.4 + 0.8) * 0.18
      }
    }
    if (mouth.current) {
      if (gesture === 'talk' || gesture === 'wave' || gesture === 'greet') mouth.current.scale.y = 1 + Math.sin(t * 11) * 0.6
      else mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 1, 0.12)
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]} scale={1.22}>
      {/* soft shadow below */}
      <mesh position={[0, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>

      {/* dress / body */}
      <group ref={body} position={[0, 0.22, 0]}>
        <mesh ref={dress} position={[0, -0.05, 0]}>
          <coneGeometry args={[0.48, 0.78, 16]} />
          <meshStandardMaterial color="#ff7eb3" roughness={0.6} emissive="#c2185b" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <capsuleGeometry args={[0.28, 0.32, 8, 12]} />
          <meshStandardMaterial color="#fff0f5" roughness={0.5} />
        </mesh>
        {/* collar */}
        <mesh position={[0, 0.38, 0.18]} rotation={[0.9, 0, 0]}>
          <torusGeometry args={[0.12, 0.02, 8, 12]} />
          <meshStandardMaterial color="#ffc1c1" />
        </mesh>
        {/* belt */}
        <mesh position={[0, -0.02, 0.24]} scale={[1, 0.6, 1]}>
          <torusGeometry args={[0.26, 0.03, 8, 16]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.12, 0]}>
        <mesh>
          <sphereGeometry args={[0.46, 24, 24]} />
          <meshStandardMaterial color="#ffdbac" roughness={0.45} />
        </mesh>
        {/* blush */}
        <mesh position={[-0.2, -0.1, 0.38]}>
          <circleGeometry args={[0.08, 12]} />
          <meshBasicMaterial color="#f48fb1" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0.2, -0.1, 0.38]}>
          <circleGeometry args={[0.08, 12]} />
          <meshBasicMaterial color="#f48fb1" transparent opacity={0.45} />
        </mesh>
        {/* eyes - large cartoon */}
        <group position={[0, 0.08, 0.4]}>
          <mesh ref={eyeL} position={[-0.16, 0, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#fff" roughness={0.2} />
          </mesh>
          <mesh position={[-0.16, 0, 0.07]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#4a148c" />
          </mesh>
          <mesh position={[-0.16, 0, 0.09]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[-0.13, 0.05, 0.1]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          {/* eyelash */}
          <mesh position={[-0.16, 0.11, 0.08]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.012, 0.16, 4, 6]} />
            <meshStandardMaterial color="#3e2723" />
          </mesh>

          <mesh ref={eyeR} position={[0.16, 0, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#fff" roughness={0.2} />
          </mesh>
          <mesh position={[0.16, 0, 0.07]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#4a148c" />
          </mesh>
          <mesh position={[0.16, 0, 0.09]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0.19, 0.05, 0.1]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <mesh position={[0.16, 0.11, 0.08]} rotation={[0, 0, -0.2]}>
            <capsuleGeometry args={[0.012, 0.16, 4, 6]} />
            <meshStandardMaterial color="#3e2723" />
          </mesh>
        </group>
        {/* mouth - cute small */}
        <mesh ref={mouth} position={[0, -0.16, 0.42]}>
          <capsuleGeometry args={[0.03, 0.06, 4, 8]} />
          <meshStandardMaterial color="#ad1457" />
        </mesh>
        <mesh position={[0, -0.16, 0.43]}>
          <circleGeometry args={[0.02, 8]} />
          <meshBasicMaterial color="#ff8a80" />
        </mesh>

        {/* RED WAVY HAIR */}
        {/* top dome */}
        <mesh ref={hairTop} position={[0, 0.32, -0.04]}>
          <sphereGeometry args={[0.52, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color="#c62828" roughness={0.7} emissive="#b71c1c" emissiveIntensity={0.08} />
        </mesh>
        {/* front bangs wavy */}
        <mesh position={[0, 0.28, 0.38]} rotation={[0.6, 0, 0]}>
          <capsuleGeometry args={[0.05, 0.32, 4, 8]} />
          <meshStandardMaterial color="#e53935" />
        </mesh>
        <mesh position={[-0.14, 0.26, 0.36]} rotation={[0.5, 0.3, 0.25]}>
          <capsuleGeometry args={[0.045, 0.28, 4, 8]} />
          <meshStandardMaterial color="#e53935" />
        </mesh>
        <mesh position={[0.14, 0.26, 0.36]} rotation={[0.5, -0.3, -0.25]}>
          <capsuleGeometry args={[0.045, 0.28, 4, 8]} />
          <meshStandardMaterial color="#e53935" />
        </mesh>
        {/* side wavy locks - left */}
        <group ref={waveL} position={[-0.48, 0.15, 0]}>
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, 0.18]}>
            <capsuleGeometry args={[0.11, 0.62, 6, 10]} />
            <meshStandardMaterial color="#d32f2f" roughness={0.6} />
          </mesh>
          <mesh position={[0.04, -0.58, 0.04]} rotation={[0.2, 0, 0.18]}>
            <capsuleGeometry args={[0.09, 0.4, 6, 8]} />
            <meshStandardMaterial color="#e53935" />
          </mesh>
          <mesh position={[-0.04, -0.38, 0.12]} rotation={[0.3, 0.2, 0.12]}>
            <torusGeometry args={[0.09, 0.025, 6, 10, Math.PI]} />
            <meshStandardMaterial color="#ff7961" />
          </mesh>
        </group>
        {/* side wavy locks - right */}
        <group ref={waveR} position={[0.48, 0.15, 0]}>
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, -0.18]}>
            <capsuleGeometry args={[0.11, 0.62, 6, 10]} />
            <meshStandardMaterial color="#d32f2f" roughness={0.6} />
          </mesh>
          <mesh position={[-0.04, -0.58, 0.04]} rotation={[0.2, 0, -0.18]}>
            <capsuleGeometry args={[0.09, 0.4, 6, 8]} />
            <meshStandardMaterial color="#e53935" />
          </mesh>
          <mesh position={[0.04, -0.38, 0.12]} rotation={[0.3, -0.2, -0.12]}>
            <torusGeometry args={[0.09, 0.025, 6, 10, Math.PI]} />
            <meshStandardMaterial color="#ff7961" />
          </mesh>
        </group>
        {/* back long wavy hair */}
        <group ref={hairBack} position={[0, -0.05, -0.38]}>
          <mesh position={[0, -0.18, 0]} scale={[1.05, 1.3, 0.55]}>
            <sphereGeometry args={[0.48, 16, 12]} />
            <meshStandardMaterial color="#b71c1c" roughness={0.65} />
          </mesh>
          <mesh position={[-0.18, -0.42, 0.08]} rotation={[0.2, 0.3, 0.5]}>
            <capsuleGeometry args={[0.09, 0.5, 6, 8]} />
            <meshStandardMaterial color="#c62828" />
          </mesh>
          <mesh position={[0.18, -0.42, 0.08]} rotation={[0.2, -0.3, -0.5]}>
            <capsuleGeometry args={[0.09, 0.5, 6, 8]} />
            <meshStandardMaterial color="#c62828" />
          </mesh>
          <mesh position={[0, -0.62, 0.02]} rotation={[0.4, 0, 0]}>
            <torusGeometry args={[0.14, 0.03, 8, 14, Math.PI]} />
            <meshStandardMaterial color="#ff5252" emissive="#ff5252" emissiveIntensity={0.12} />
          </mesh>
          {/* hair shine */}
          <mesh position={[-0.22, 0.08, 0.32]} rotation={[0, 0, 0.4]}>
            <capsuleGeometry args={[0.025, 0.22, 4, 6]} />
            <meshBasicMaterial color="#ffab91" transparent opacity={0.85} />
          </mesh>
        </group>
        {/* bow */}
        <group position={[0.38, 0.42, 0.18]} rotation={[0, -0.4, 0.2]}>
          <mesh><sphereGeometry args={[0.07, 10, 10]} /><meshStandardMaterial color="#ff4081" /></mesh>
          <mesh position={[-0.09, 0, 0]}><sphereGeometry args={[0.07, 10, 10]} scale={[1, 0.7, 0.5]} /><meshStandardMaterial color="#ff4081" /></mesh>
          <mesh position={[0.09, 0, 0]}><sphereGeometry args={[0.07, 10, 10]} scale={[1, 0.7, 0.5]} /><meshStandardMaterial color="#ff4081" /></mesh>
        </group>
      </group>

      {/* arms - slender cartoon */}
      <group ref={leftArm} position={[-0.32, 0.42, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.07, 0.32, 6, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0, -0.44, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.32, 0.42, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.07, 0.32, 6, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0, -0.44, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      </group>

      {/* legs - hovering dangled, cute shoes */}
      <group ref={leftLeg} position={[-0.16, -0.38, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.08, 0.28, 6, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0, -0.38, 0.04]}>
          <sphereGeometry args={[0.11, 10, 10]} scale={[1, 0.7, 1.3]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[0, -0.38, 0.08]} scale={[1, 0.5, 1.2]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#ff4081" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.16, -0.38, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.08, 0.28, 6, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0, -0.38, 0.04]}>
          <sphereGeometry args={[0.11, 10, 10]} scale={[1, 0.7, 1.3]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[0, -0.38, 0.08]} scale={[1, 0.5, 1.2]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#ff4081" />
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
    msgs.push({ text: `Hiii ${name}! I'm Mimi — your floating buddy! 💖`, gesture: 'wave', emoji: '👧' })
    msgs.push({ text: `I float left-right all day just to cheer you! ✨`, gesture: 'greet', emoji: '🌸' })
    if (stats.total === 0) msgs.push({ text: `First solve = I do a spin for you! Let's gooo! 🌀`, gesture: 'spin', emoji: '💃' })
    else msgs.push({ text: `Wow ${stats.total} solves?! You're my hero! 🌟`, gesture: 'excited', emoji: '🚀' })
    if (stats.streak === 0) msgs.push({ text: `Streak 0? Tap Start playing — I'll drift beside you!`, gesture: 'point', emoji: '👉' })
    else msgs.push({ text: `${stats.streak} day streak! I'm literally floating with joy! 🥹`, gesture: 'nod', emoji: '💜' })
    if (stats.accuracy < 60 && stats.total > 0) msgs.push({ text: `Accuracy ${stats.accuracy}% — let's check edge cases together, okay? 🤓`, gesture: 'think', emoji: '🧠' })
    if (stats.hardSolved === 0) msgs.push({ text: `No Hard yet? My red hair gets nervous but we slay! 😤`, gesture: 'excited', emoji: '🔥' })
    if (stats.tier.name === 'Legend') msgs.push({ text: `LEGEND ${name}?! I'm bowing mid-air! 🙇‍♀️`, gesture: 'nod', emoji: '👑' })
    else msgs.push({ text: `${stats.tier.next - stats.rating} pts to ${tier.next || 'Legend'} — I'll float you there! 🎯`, gesture: 'point', emoji: '🌈' })
    stats.tips.forEach((t) => msgs.push({ text: t, gesture: 'think', emoji: '💡' }))
    msgs.push({ text: `Click me for a spin! Hover — I wave & turn to greet you!`, gesture: 'wave', emoji: '😆' })
    msgs.push({ text: `Why do coders love my hair? It's a-red-able! 😂`, gesture: 'greet', emoji: '💁‍♀️' })
    return msgs
  }, [stats, tier, user])

  useEffect(() => {
    const t1 = setTimeout(() => setGesture('idle'), 2200)
    const iv = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % messages.length
        setGesture(messages[next].gesture)
        setTimeout(() => setGesture('idle'), 2200)
        return next
      })
    }, 6200)
    return () => { clearTimeout(t1); clearInterval(iv) }
  }, [messages])

  const current = messages[idx]
  useEffect(() => {
    setGesture(current.gesture)
    const t = setTimeout(() => setGesture('idle'), 1700)
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
      <div className="buddy-card girl" onPointerMove={handlePointerMove}>
        <div className="buddy-header">
          <span className="buddy-title" style={{ background: 'linear-gradient(90deg,#ff4081,#ff8a65)', WebkitBackgroundClip: 'text' }}>Meet Mimi</span>
          <span className="buddy-sub">your wavy-haired hover buddy • only here</span>
        </div>
        <div className="buddy-canvas-wrap girl-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }} onClick={() => setIdx((i) => (i + 1) % messages.length)}>
          <motion.div animate={{ y: [0, -14, 0], x: [0, 8, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '5.2rem', filter: 'drop-shadow(0 12px 24px rgba(255,64,129,0.35))' }}>👧‍🦰</motion.div>
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
    <div className="buddy-card girl" onPointerMove={handlePointerMove}>
      <div className="buddy-header">
        <span className="buddy-title" style={{ background: 'linear-gradient(90deg,#ff4081,#ff8a65)', WebkitBackgroundClip: 'text' }}>Meet Mimi</span>
        <span className="buddy-sub">red wavy hair • hovering • only here</span>
      </div>

      <div className="buddy-canvas-wrap girl-wrap" onClick={() => setIdx((i) => (i + 1) % messages.length)}>
        <Canvas
          camera={{ position: [0, 0.65, 3.05], fov: 40 }}
          dpr={[1, 1.3]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <ambientLight intensity={1.05} color="#fff5e6" />
          <directionalLight position={[2, 4, 2]} intensity={1.3} color="#fff8e1" />
          <pointLight position={[-2, 2, 2]} intensity={20} color="#ff8a65" distance={4} decay={2} />
          <pointLight position={[2, 1.6, 2]} intensity={16} color="#ffd54f" distance={4} decay={2} />
          <pointLight position={[0, 1.5, 0]} intensity={8} color="#ffccbc" distance={2.5} />
          {/* warm god-rays behind */}
          <mesh position={[0, 0.3, -1.2]}>
            <planeGeometry args={[3.2, 2.2]} />
            <meshBasicMaterial color="#ffab91" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
          <RedHairGirl gesture={gesture} mouse={mouse} />
          {/* warm sparkles acot style */}
          <mesh position={[0.95, 0.85, 0.2]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#ffd54f" emissive="#ff8a65" emissiveIntensity={1} /></mesh>
          <mesh position={[-0.95, 0.62, 0.15]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#ff8a80" emissive="#ff8a80" emissiveIntensity={0.9} /></mesh>
          <mesh position={[0, 1.55, -0.2]}><sphereGeometry args={[0.05, 6, 6]} /><meshStandardMaterial color="#fff9c4" emissive="#fff59d" emissiveIntensity={0.6} /></mesh>
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
          👆 click Mimi • she drifts left-right & spins
        </motion.div>
      </div>

      <div className="buddy-controls">
        <div className="buddy-gestures">
          {[
            { k: 'wave', l: '👋 Wave', g: 'wave' },
            { k: 'spin', l: '🌀 Spin', g: 'spin' },
            { k: 'dance', l: '💃 Dance', g: 'dance' },
            { k: 'greet', l: '💁‍♀️ Greet', g: 'greet' },
            { k: 'think', l: '🤔 Think', g: 'think' },
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
