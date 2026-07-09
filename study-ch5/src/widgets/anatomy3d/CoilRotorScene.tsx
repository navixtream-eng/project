import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import type { Group } from 'three'

const COLORS = { coil: '#199e70', rotorN: '#e66767', rotorS: '#3987e5', shaft: '#52525b' }

const COIL_TURNS = 8
const COIL_LENGTH = 1.5
const COIL_R = 0.55
const BAR_HALF_LEN = 0.42
const BAR_R = 0.16

function Scene({ thetaRef }: { thetaRef: { current: number } }) {
  const rotorGroup = useRef<Group>(null)
  useFrame(() => {
    if (rotorGroup.current) rotorGroup.current.rotation.z = thetaRef.current
  })

  return (
    <group>
      {/* Bobina: vueltas de alambre alrededor del eje magnético (X) */}
      {Array.from({ length: COIL_TURNS }, (_, i) => {
        const x = -COIL_LENGTH / 2 + (i / (COIL_TURNS - 1)) * COIL_LENGTH
        return (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <torusGeometry args={[COIL_R, 0.032, 12, 48]} />
            <meshStandardMaterial color={COLORS.coil} metalness={0.75} roughness={0.3} />
          </mesh>
        )
      })}

      {/* Eje magnético de la bobina (línea de referencia) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, COIL_LENGTH * 1.5, 6]} />
        <meshBasicMaterial color="#52525b" transparent opacity={0.5} />
      </mesh>

      {/* Rotor: barra imantada N-S que gira sobre el eje Z */}
      <group ref={rotorGroup}>
        <mesh position={[BAR_HALF_LEN / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[BAR_R, BAR_HALF_LEN, 6, 16]} />
          <meshStandardMaterial color={COLORS.rotorN} metalness={0.55} roughness={0.3} emissive={COLORS.rotorN} emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[-BAR_HALF_LEN / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[BAR_R, BAR_HALF_LEN, 6, 16]} />
          <meshStandardMaterial color={COLORS.rotorS} metalness={0.55} roughness={0.3} emissive={COLORS.rotorS} emissiveIntensity={0.18} />
        </mesh>
        {/* Eje central del rotor, saliendo hacia la cámara */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
          <meshStandardMaterial color={COLORS.shaft} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Escena 3D del acople bobina-rotor: la barra imantada gira dentro del eje
 * de la bobina de fase a. El ángulo lo controla un ref externo (thetaRef)
 * actualizado por el bucle de animación del widget contenedor.
 */
export default function CoilRotorScene({ thetaRef }: { thetaRef: { current: number } }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [1.35, 1.0, 2.5], fov: 36, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b0d']} />
      <hemisphereLight args={['#6d7f99', '#0a0a0c', 0.65]} />
      <directionalLight position={[2.5, 3, 2]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-2.5, 1, -1.5]} intensity={0.3} color="#3987e5" />

      <Suspense fallback={null}>
        <Scene thetaRef={thetaRef} />
        <ContactShadows position={[0, -0.75, 0]} opacity={0.5} scale={5} blur={2.2} far={1.4} resolution={512} />
        <Environment resolution={256} background={false}>
          <Lightformer intensity={2} color="#f4f4f5" position={[0, 3, 2]} scale={[6, 6, 1]} form="rect" />
          <Lightformer intensity={0.6} color="#199e70" position={[-3, 0.5, 2]} scale={[5, 5, 1]} form="rect" />
          <Lightformer intensity={0.6} color="#c98500" position={[3, 0.5, -2]} scale={[5, 5, 1]} form="rect" />
        </Environment>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={1.4}
        maxDistance={4}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.6}
      />
    </Canvas>
  )
}
