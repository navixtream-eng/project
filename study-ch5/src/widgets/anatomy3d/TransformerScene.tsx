import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const COLORS = { core: '#3f3f46', p: '#3987e5', s: '#c98500', flux: '#199e70', load: '#10b981' }

// Núcleo tipo ventana (unidades arbitrarias). El eje del núcleo mira a +Z.
const W = 0.8
const H = 1.0
const T = 0.3
const D = 0.3
const LEG_X = W - T / 2
const LEG_SPAN = 2 * (H - T)
const Z_FLUX = D / 2 + 0.02
const MAX_TURNS = 16

function Core() {
  const mat = (
    <meshStandardMaterial color={COLORS.core} metalness={0.55} roughness={0.46} />
  )
  return (
    <group>
      {[H - T / 2, -(H - T / 2)].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[2 * W, T, D]} />
          {mat}
        </mesh>
      ))}
      {[-LEG_X, LEG_X].map((x) => (
        <mesh key={x} position={[x, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[T, LEG_SPAN, D]} />
          {mat}
        </mesh>
      ))}
    </group>
  )
}

function Winding({ x, turns, color }: { x: number; turns: number; color: string }) {
  const n = Math.min(MAX_TURNS, Math.max(2, turns))
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const y = -LEG_SPAN / 2 + 0.1 + (i / (n - 1)) * (LEG_SPAN - 0.2)
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[T / 2 + 0.07, 0.045, 12, 32]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.28} />
          </mesh>
        )
      })}
    </group>
  )
}

function Flux() {
  const curve = useMemo(() => {
    const cx = LEG_X
    const cy = H - T / 2
    const pts = [
      new THREE.Vector3(0, cy, Z_FLUX),
      new THREE.Vector3(cx, cy, Z_FLUX),
      new THREE.Vector3(cx, 0, Z_FLUX),
      new THREE.Vector3(cx, -cy, Z_FLUX),
      new THREE.Vector3(0, -cy, Z_FLUX),
      new THREE.Vector3(-cx, -cy, Z_FLUX),
      new THREE.Vector3(-cx, 0, Z_FLUX),
      new THREE.Vector3(-cx, cy, Z_FLUX),
    ]
    return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.15)
  }, [])
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.045, 16, true), [curve])
  const particles = useRef<THREE.Group>(null)
  const offset = useRef(0)
  const N_P = 6
  useFrame((_, dt) => {
    offset.current = (offset.current + dt * 0.13) % 1
    const g = particles.current
    if (!g) return
    g.children.forEach((child, i) => {
      const p = curve.getPointAt((offset.current + i / N_P) % 1)
      child.position.set(p.x, p.y, p.z)
    })
  })
  return (
    <group>
      <mesh geometry={tube}>
        <meshStandardMaterial color={COLORS.flux} emissive={COLORS.flux} emissiveIntensity={0.8} metalness={0.2} roughness={0.5} transparent opacity={0.9} />
      </mesh>
      <group ref={particles}>
        {Array.from({ length: N_P }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshStandardMaterial color="#b8f0d8" emissive="#b8f0d8" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Load() {
  const wireMat = <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.3} />
  const yTop = 0.42
  const yBot = -0.42
  const xEnd = 1.55
  return (
    <group>
      {/* Cables desde el secundario hacia la carga */}
      {[yTop, yBot].map((y) => (
        <mesh key={y} position={[(LEG_X + 0.2 + xEnd) / 2, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, xEnd - (LEG_X + 0.2), 12]} />
          {wireMat}
        </mesh>
      ))}
      {/* Tramos verticales que cierran sobre la resistencia */}
      {[yTop, yBot].map((y) => (
        <mesh key={`v${y}`} position={[xEnd, y - Math.sign(y) * 0.12, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 12]} />
          {wireMat}
        </mesh>
      ))}
      {/* Resistencia (carga Z) */}
      <mesh position={[xEnd, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.4, 0.16]} />
        <meshStandardMaterial color="#0b3a2b" emissive={COLORS.load} emissiveIntensity={0.35} metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Scene({ turns1, turns2 }: { turns1: number; turns2: number }) {
  return (
    <group>
      <Core />
      <Winding x={-LEG_X} turns={turns1} color={COLORS.p} />
      <Winding x={LEG_X} turns={turns2} color={COLORS.s} />
      <Flux />
      <Load />
    </group>
  )
}

export default function TransformerScene({ turns1, turns2 }: { turns1: number; turns2: number }) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.6]}
      camera={{ position: [1.15, 0.9, 3.5], fov: 37, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b0d']} />
      <hemisphereLight args={['#6d7f99', '#0a0a0c', 0.6]} />
      <directionalLight position={[3, 4, 3]} intensity={1.35} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[0, 0.5, 5]} intensity={0.5} />
      <directionalLight position={[-3, 1, -2]} intensity={0.3} color="#3987e5" />

      <Suspense fallback={null}>
        <Scene turns1={turns1} turns2={turns2} />
        <ContactShadows position={[0, -1.15, 0]} opacity={0.5} scale={5} blur={2.3} far={1.5} resolution={512} />
        <Environment resolution={256} background={false}>
          <Lightformer intensity={2.1} color="#f4f4f5" position={[0, 4, 3]} scale={[7, 7, 1]} form="rect" />
          <Lightformer intensity={0.65} color="#3987e5" position={[-4, 1, 3]} scale={[5, 5, 1]} form="rect" />
          <Lightformer intensity={0.65} color="#c98500" position={[4, 0.5, -2]} scale={[5, 5, 1]} form="rect" />
        </Environment>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        target={[0.35, 0, 0]}
        minDistance={2.4}
        maxDistance={6}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.7}
      />
    </Canvas>
  )
}
