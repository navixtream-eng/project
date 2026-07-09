import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const COLORS = { steel: '#3f3f46', coil: '#c98500', force: '#e66767', flux: '#3987e5' }

// Yugo en C (unidades arbitrarias). Cara de la máquina mira a +Z.
const T = 0.34 // espesor de hierro
const D = 0.42 // profundidad en Z
const YH = 0.66 // semialto exterior del yugo
const ARM_Y = YH - T / 2 // centro de los brazos horizontales
const SPINE_X = -1.0 // centro del lomo vertical
const POLE_X = 0.55 // cara de los polos (extremo de los brazos)
const WA = 0.34 // ancho del émbolo

function steelMat() {
  return <meshStandardMaterial color={COLORS.steel} metalness={0.6} roughness={0.42} />
}

function Yoke() {
  return (
    <group>
      {/* Lomo (vertical, lleva la bobina) */}
      <mesh position={[SPINE_X, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, 2 * YH, D]} />
        {steelMat()}
      </mesh>
      {/* Brazos superior e inferior */}
      {[ARM_Y, -ARM_Y].map((y) => {
        const x0 = SPINE_X - T / 2
        const len = POLE_X + T / 2 - x0
        return (
          <mesh key={y} position={[x0 + len / 2, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[len, T, D]} />
            {steelMat()}
          </mesh>
        )
      })}
    </group>
  )
}

function Coil({ turns }: { turns: number }) {
  const n = Math.min(12, Math.max(3, turns))
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const span = 2 * YH - T - 0.1
        const y = -span / 2 + (i / (n - 1)) * span
        return (
          <mesh key={i} position={[SPINE_X, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[T / 2 + 0.08, 0.045, 12, 32]} />
            <meshStandardMaterial color={COLORS.coil} metalness={0.85} roughness={0.28} />
          </mesh>
        )
      })}
    </group>
  )
}

function Armature({ gapVisual }: { gapVisual: number }) {
  const cx = POLE_X + gapVisual + WA / 2
  return (
    <mesh position={[cx, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[WA, 2 * YH, D]} />
      {steelMat()}
    </mesh>
  )
}

function GapGlow({ gapVisual }: { gapVisual: number }) {
  const gx = POLE_X + gapVisual / 2
  return (
    <group>
      {[ARM_Y, -ARM_Y].map((y) => (
        <mesh key={y} position={[gx, y, 0]}>
          <boxGeometry args={[Math.max(0.02, gapVisual), T * 1.02, D * 1.02]} />
          <meshStandardMaterial color={COLORS.force} emissive={COLORS.force} emissiveIntensity={0.6} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Flux({ gapVisual, radius, speed }: { gapVisual: number; radius: number; speed: number }) {
  const armCx = POLE_X + gapVisual + WA / 2
  const z = D / 2 + 0.02
  const curve = useMemo(() => {
    const pts = [
      new THREE.Vector3(SPINE_X, ARM_Y, z),
      new THREE.Vector3(armCx, ARM_Y, z),
      new THREE.Vector3(armCx, -ARM_Y, z),
      new THREE.Vector3(SPINE_X, -ARM_Y, z),
    ]
    return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.1)
  }, [armCx, z])
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 180, radius, 16, true), [curve, radius])
  const particles = useRef<THREE.Group>(null)
  const offset = useRef(0)
  const N_P = 5
  useFrame((_, dt) => {
    offset.current = (offset.current + dt * speed) % 1
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
        <meshStandardMaterial color={COLORS.flux} emissive={COLORS.flux} emissiveIntensity={0.85} metalness={0.2} roughness={0.5} transparent opacity={0.9} />
      </mesh>
      <group ref={particles}>
        {Array.from({ length: N_P }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[Math.min(0.04, radius * 0.9 + 0.012), 12, 12]} />
            <meshStandardMaterial color="#bcd8ff" emissive="#bcd8ff" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function ForceArrow({ gapVisual, len }: { gapVisual: number; len: number }) {
  const armRight = POLE_X + gapVisual + WA
  const group = useRef<THREE.Group>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt
    if (group.current) {
      const s = 1 + 0.12 * Math.sin(t.current * 4)
      group.current.scale.set(s, 1, 1)
    }
  })
  // Flecha apuntando a −X (hacia el yugo): el campo cierra el gap
  const shaftLen = len * 0.7
  return (
    <group ref={group} position={[armRight + 0.12, 0, 0]}>
      <mesh position={[shaftLen / 2 + 0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, shaftLen, 12]} />
        <meshStandardMaterial color={COLORS.force} emissive={COLORS.force} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.16, 16]} />
        <meshStandardMaterial color={COLORS.force} emissive={COLORS.force} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function Scene({ turns, gapVisual, fluxRadius, forceLen, fluxSpeed }: {
  turns: number; gapVisual: number; fluxRadius: number; forceLen: number; fluxSpeed: number
}) {
  return (
    <group position={[0, 0, 0]}>
      <Yoke />
      <Coil turns={turns} />
      <Armature gapVisual={gapVisual} />
      <GapGlow gapVisual={gapVisual} />
      <Flux gapVisual={gapVisual} radius={fluxRadius} speed={fluxSpeed} />
      <ForceArrow gapVisual={gapVisual} len={forceLen} />
    </group>
  )
}

export default function ActuatorScene(props: {
  turns: number; gapVisual: number; fluxRadius: number; forceLen: number; fluxSpeed: number
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [0.2, 0.8, 4.1], fov: 36, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b0d']} />
      <hemisphereLight args={['#6d7f99', '#0a0a0c', 0.6]} />
      <directionalLight position={[3, 4, 3]} intensity={1.35} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[0, 0.5, 5]} intensity={0.5} />
      <directionalLight position={[-3, 1, -2]} intensity={0.3} color="#3987e5" />

      <Suspense fallback={null}>
        <Scene {...props} />
        <ContactShadows position={[0, -1.0, 0]} opacity={0.5} scale={5} blur={2.3} far={1.5} resolution={512} />
        <Environment resolution={256} background={false}>
          <Lightformer intensity={2.1} color="#f4f4f5" position={[0, 4, 3]} scale={[7, 7, 1]} form="rect" />
          <Lightformer intensity={0.65} color="#3987e5" position={[-4, 1, 3]} scale={[5, 5, 1]} form="rect" />
          <Lightformer intensity={0.65} color="#c98500" position={[4, 0.5, -2]} scale={[5, 5, 1]} form="rect" />
        </Environment>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        target={[0.12, 0, 0]}
        minDistance={2.6}
        maxDistance={6.5}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.7}
      />
    </Canvas>
  )
}
