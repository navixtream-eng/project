import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import type { Group } from 'three'
import { annulusWedgeShape, extrudeAxial, toRad } from './shapes'

const COLORS = {
  steel: '#3f3f46',
  copper: '#e2761f',
  brush: '#18181b',
  Ncore: '#5a3a3a',
  Score: '#39445a',
  field: '#c98500',
}

const LEN = 1.5 // longitud del inducido (a lo largo de Z)
const R_ARM = 0.4
const R_SHOE_IN = 0.47
const R_SHOE_OUT = 0.72
const R_YOKE_IN = 1.0
const R_YOKE_OUT = 1.16
const COMM_Z = LEN / 2 + 0.28
const COMM_R = 0.17
const COMM_IN = 0.09

function steelMat(color = COLORS.steel) {
  return <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
}

/** Zapata polar: sector de anillo extruido a lo largo de Z. */
function PoleShoe({ centerDeg, color }: { centerDeg: number; color: string }) {
  const geo = useMemo(
    () => extrudeAxial(annulusWedgeShape(R_SHOE_OUT, R_SHOE_IN, toRad(centerDeg - 52), toRad(centerDeg + 52)), LEN),
    [centerDeg],
  )
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.45} />
    </mesh>
  )
}

/** Yugo exterior (anillo completo) que cierra el circuito magnético. */
function Yoke() {
  const geo = useMemo(() => extrudeAxial(annulusWedgeShape(R_YOKE_OUT, R_YOKE_IN, 0, Math.PI * 2), LEN * 0.92, 64), [])
  return (
    <mesh geometry={geo} receiveShadow>
      {steelMat('#34343a')}
    </mesh>
  )
}

/** Núcleo del polo + bobina de campo (fijos), arriba (N) y abajo (S). */
function PoleCore({ sign, color }: { sign: 1 | -1; color: string }) {
  const y = sign * ((R_SHOE_OUT + R_YOKE_IN) / 2)
  const h = R_YOKE_IN - R_SHOE_OUT
  return (
    <group>
      <mesh position={[0, y, 0]} castShadow>
        <boxGeometry args={[0.5, h, LEN * 0.9]} />
        {steelMat(color)}
      </mesh>
      {[-0.3, 0, 0.3].map((z) => (
        <mesh key={z} position={[0, y, z * (LEN * 0.9)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.34, 0.055, 12, 28]} />
          <meshStandardMaterial color={COLORS.field} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/** Inducido: núcleo laminado + espira de cobre + colector, todo girando. */
function Armature({ segments, spinRef }: { segments: number; spinRef: React.RefObject<Group | null> }) {
  const commGeos = useMemo(() => {
    const n = Math.max(2, segments)
    const gap = 0.06 / n
    return Array.from({ length: n }, (_, i) => {
      const a0 = (i / n) * Math.PI * 2 + gap
      const a1 = ((i + 1) / n) * Math.PI * 2 - gap
      return extrudeAxial(annulusWedgeShape(COMM_R, COMM_IN, a0, a1), 0.34, 8)
    })
  }, [segments])

  return (
    <group ref={spinRef}>
      {/* Eje */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, LEN + 1.1, 20]} />
        {steelMat('#52525b')}
      </mesh>
      {/* Núcleo del inducido */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R_ARM, R_ARM, LEN, 40]} />
        {steelMat('#2c2c31')}
      </mesh>
      {/* Espira de cobre: dos lados activos (arriba/abajo) + cabezas de bobina */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * (R_ARM + 0.03), 0]} castShadow>
          <boxGeometry args={[0.14, 0.09, LEN + 0.06]} />
          <meshStandardMaterial color={COLORS.copper} metalness={0.85} roughness={0.28} emissive={COLORS.copper} emissiveIntensity={0.12} />
        </mesh>
      ))}
      {[1, -1].map((zside) => (
        <mesh key={`e${zside}`} position={[0, 0, zside * (LEN / 2 + 0.03)]} castShadow>
          <boxGeometry args={[0.14, 2 * (R_ARM + 0.03) + 0.09, 0.09]} />
          <meshStandardMaterial color={COLORS.copper} metalness={0.85} roughness={0.28} />
        </mesh>
      ))}
      {/* Colector de delgas */}
      <group position={[0, 0, COMM_Z]}>
        {commGeos.map((geo, i) => (
          <mesh key={i} geometry={geo} castShadow>
            <meshStandardMaterial color={COLORS.copper} metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Escobillas fijas que presionan el colector arriba y abajo. */
function Brushes() {
  return (
    <group position={[0, 0, COMM_Z]}>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0, s * (COMM_R + 0.05), 0]} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.16]} />
            <meshStandardMaterial color={COLORS.brush} metalness={0.2} roughness={0.85} />
          </mesh>
          <mesh position={[0, s * (COMM_R + 0.22), 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.28, 10]} />
            <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Aplica el ángulo externo (thetaRef) al grupo giratorio en cada cuadro. */
function Spinner({ spinRef, thetaRef }: { spinRef: React.RefObject<Group | null>; thetaRef: { current: number } }) {
  useFrame(() => {
    if (spinRef.current) spinRef.current.rotation.z = thetaRef.current
  })
  return null
}

export default function CommutatorScene({
  thetaRef,
  segments,
}: {
  thetaRef: { current: number }
  segments: number
}) {
  const spinRef = useRef<Group>(null)

  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [2.1, 1.5, 4.2], fov: 32, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b0d']} />
      <hemisphereLight args={['#7d8fa9', '#0a0a0c', 0.75]} />
      <directionalLight position={[3, 4, 3]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[1, 0.8, 5]} intensity={0.7} />
      <directionalLight position={[-3, 1, -2]} intensity={0.35} color="#3987e5" />

      <Suspense fallback={null}>
        <group rotation={[0.15, 0, 0]} scale={0.88}>
          <Yoke />
          <PoleShoe centerDeg={90} color={COLORS.Ncore} />
          <PoleShoe centerDeg={270} color={COLORS.Score} />
          <PoleCore sign={1} color={COLORS.Ncore} />
          <PoleCore sign={-1} color={COLORS.Score} />
          <Armature segments={segments} spinRef={spinRef} />
          <Brushes />
          <Spinner spinRef={spinRef} thetaRef={thetaRef} />
        </group>
        <ContactShadows position={[0, -1.25, 0]} opacity={0.5} scale={5} blur={2.3} far={1.6} resolution={512} />
        <Environment resolution={256} background={false}>
          <Lightformer intensity={2.1} color="#f4f4f5" position={[0, 4, 3]} scale={[7, 7, 1]} form="rect" />
          <Lightformer intensity={0.65} color="#e2761f" position={[4, 1, 3]} scale={[5, 5, 1]} form="rect" />
          <Lightformer intensity={0.6} color="#3987e5" position={[-4, 0.5, -2]} scale={[5, 5, 1]} form="rect" />
        </Environment>
      </Suspense>

      <OrbitControls makeDefault enablePan={false} minDistance={2.2} maxDistance={6} minPolarAngle={Math.PI * 0.12} maxPolarAngle={Math.PI * 0.7} />
    </Canvas>
  )
}
