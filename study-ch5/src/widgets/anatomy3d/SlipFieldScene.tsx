import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { annulusWedgeShape, extrudeAxial, toRad } from './shapes'

const COLORS = { steel: '#494952', core: '#3a3a42', bar: '#d4d8e0', N: '#e66767', S: '#3987e5', induced: '#2effb0' }
const NBAR = 16
const LEN = 1.05
const R_BAR = 0.66

type AngleRef = { current: number }

/** Actualiza en cada cuadro los ángulos y el brillo de corriente inducida por barra. */
function Updater({
  fieldRef,
  rotorRef,
  slipRef,
  fieldGroup,
  rotorGroup,
  bars,
}: {
  fieldRef: AngleRef
  rotorRef: AngleRef
  slipRef: AngleRef
  fieldGroup: React.RefObject<THREE.Group | null>
  rotorGroup: React.RefObject<THREE.Group | null>
  bars: React.RefObject<(THREE.Mesh | null)[]>
}) {
  useFrame(() => {
    if (fieldGroup.current) fieldGroup.current.rotation.z = fieldRef.current
    if (rotorGroup.current) rotorGroup.current.rotation.z = rotorRef.current
    const glow = Math.min(1, slipRef.current * 4)
    const arr = bars.current
    if (!arr) return
    for (let i = 0; i < arr.length; i++) {
      const m = arr[i]
      if (!m) continue
      const a = (i / NBAR) * Math.PI * 2
      // Posición de la barra relativa al campo giratorio (creep = deslizamiento)
      const rel = a + rotorRef.current - fieldRef.current
      const g = Math.max(0, Math.sin(rel)) * glow
      const mat = m.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = g * 3.4
    }
  })
  return null
}

function Scene({
  fieldRef,
  rotorRef,
  slipRef,
}: {
  fieldRef: AngleRef
  rotorRef: AngleRef
  slipRef: AngleRef
}) {
  const fieldGroup = useRef<THREE.Group>(null)
  const rotorGroup = useRef<THREE.Group>(null)
  const bars = useRef<(THREE.Mesh | null)[]>([])

  const statorGeo = useMemo(() => extrudeAxial(annulusWedgeShape(1.16, 0.78, 0, Math.PI * 2), LEN, 64), [])
  const poleGeo = useMemo(() => extrudeAxial(annulusWedgeShape(0.77, 0.71, toRad(-36), toRad(36)), LEN * 0.98), [])

  return (
    <group rotation={[0.28, 0, 0]}>
      {/* Estator */}
      <mesh geometry={statorGeo} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.steel} metalness={0.55} roughness={0.45} />
      </mesh>

      {/* Campo giratorio: casquetes polares N (rojo) y S (azul) en el entrehierro */}
      <group ref={fieldGroup}>
        <mesh geometry={poleGeo}>
          <meshStandardMaterial color={COLORS.N} emissive={COLORS.N} emissiveIntensity={0.9} metalness={0.1} roughness={0.6} transparent opacity={0.9} />
        </mesh>
        <mesh geometry={poleGeo} rotation={[0, 0, Math.PI]}>
          <meshStandardMaterial color={COLORS.S} emissive={COLORS.S} emissiveIntensity={0.9} metalness={0.1} roughness={0.6} transparent opacity={0.9} />
        </mesh>
        {/* Eje del campo (barra diametral con extremos N/S) */}
        <mesh position={[0, 0, LEN / 2 + 0.05]} castShadow>
          <boxGeometry args={[1.3, 0.06, 0.06]} />
          <meshStandardMaterial color="#a1a1aa" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.66, 0, LEN / 2 + 0.05]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={COLORS.N} emissive={COLORS.N} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
        <mesh position={[-0.66, 0, LEN / 2 + 0.05]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={COLORS.S} emissive={COLORS.S} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>

      {/* Rotor jaula de ardilla (gira a nm) */}
      <group ref={rotorGroup}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.62, 0.62, LEN, 40]} />
          <meshStandardMaterial color={COLORS.core} metalness={0.65} roughness={0.4} />
        </mesh>
        {Array.from({ length: NBAR }, (_, i) => {
          const a = (i / NBAR) * Math.PI * 2
          return (
            <mesh
              key={i}
              ref={(el) => {
                bars.current[i] = el
              }}
              position={[R_BAR * Math.cos(a), R_BAR * Math.sin(a), 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.055, 0.055, LEN + 0.06, 12]} />
              <meshStandardMaterial color={COLORS.bar} metalness={0.85} roughness={0.28} emissive={COLORS.induced} emissiveIntensity={0} toneMapped={false} />
            </mesh>
          )
        })}
        {/* Anillos de cortocircuito */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0, (s * (LEN + 0.06)) / 2]} castShadow>
            <torusGeometry args={[R_BAR, 0.05, 12, 40]} />
            <meshStandardMaterial color={COLORS.bar} metalness={0.85} roughness={0.3} />
          </mesh>
        ))}
        {/* Marca para ver el giro del rotor */}
        <mesh position={[0, 0.4, LEN / 2 + 0.02]}>
          <boxGeometry args={[0.08, 0.3, 0.05]} />
          <meshStandardMaterial color="#c98500" metalness={0.5} roughness={0.4} emissive="#c98500" emissiveIntensity={0.3} />
        </mesh>
      </group>

      <Updater fieldRef={fieldRef} rotorRef={rotorRef} slipRef={slipRef} fieldGroup={fieldGroup} rotorGroup={rotorGroup} bars={bars} />
    </group>
  )
}

export default function SlipFieldScene({
  fieldRef,
  rotorRef,
  slipRef,
}: {
  fieldRef: AngleRef
  rotorRef: AngleRef
  slipRef: AngleRef
}) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.6]}
      camera={{ position: [1.3, 1.15, 3.3], fov: 33, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b0d']} />
      <hemisphereLight args={['#8fa0b8', '#111', 0.95]} />
      <directionalLight position={[3, 4, 3]} intensity={1.7} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[1, 0.8, 5]} intensity={0.8} />
      <directionalLight position={[-3, 1, -2]} intensity={0.4} color="#3987e5" />

      <Suspense fallback={null}>
        <Scene fieldRef={fieldRef} rotorRef={rotorRef} slipRef={slipRef} />
        <ContactShadows position={[0, -1.35, 0]} opacity={0.5} scale={5} blur={2.3} far={1.6} resolution={512} />
        <Environment resolution={256} background={false}>
          <Lightformer intensity={2.1} color="#f4f4f5" position={[0, 4, 3]} scale={[7, 7, 1]} form="rect" />
          <Lightformer intensity={0.6} color="#e66767" position={[4, 1, 2]} scale={[5, 5, 1]} form="rect" />
          <Lightformer intensity={0.6} color="#3987e5" position={[-4, 0.5, -2]} scale={[5, 5, 1]} form="rect" />
        </Environment>
      </Suspense>

      <OrbitControls makeDefault enablePan={false} minDistance={2.2} maxDistance={6} minPolarAngle={Math.PI * 0.12} maxPolarAngle={Math.PI * 0.7} />
    </Canvas>
  )
}
