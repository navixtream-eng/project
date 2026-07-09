import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const COLORS = { core: '#3f3f46', edge: '#52525b', coil: '#c98500', flux: '#3987e5', gap: '#e66767', fringe: '#9085e9' }

// Marco cuadrado (unidades arbitrarias). El eje del núcleo mira a +Z.
const W = 1.0 // semiancho exterior
const H = 1.0 // semialto exterior
const T = 0.34 // espesor de pierna (sección cuadrada T×T)
const D = 0.34 // profundidad en Z
const LEG_X = W - T / 2 // x del centro de las piernas verticales
const LEG_SPAN = 2 * (H - T) // largo útil de las piernas verticales
const Z_FLUX = D / 2 + 0.02 // el lazo de flujo flota sobre la cara frontal

function coreMaterial(saturado: boolean) {
  return (
    <meshStandardMaterial
      color={saturado ? '#8a4038' : COLORS.core}
      metalness={0.55}
      roughness={0.46}
      emissive={saturado ? '#d8451c' : '#000000'}
      emissiveIntensity={saturado ? 0.28 : 0}
    />
  )
}

/** Lazo de flujo (rectángulo redondeado por la línea media del núcleo). */
function useLoopCurve() {
  return useMemo(() => {
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
}

function Core({ gapVisual, saturado }: { gapVisual: number; saturado: boolean }) {
  const rightHalf = (LEG_SPAN - gapVisual) / 2
  const rightOffset = gapVisual / 2 + rightHalf / 2

  return (
    <group>
      {/* Pierna superior e inferior (horizontales, ancho completo) */}
      {[H - T / 2, -(H - T / 2)].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[2 * W, T, D]} />
          {coreMaterial(saturado)}
        </mesh>
      ))}
      {/* Pierna izquierda (bajo la bobina) */}
      <mesh position={[-LEG_X, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, LEG_SPAN, D]} />
        {coreMaterial(saturado)}
      </mesh>
      {/* Pierna derecha: entera si g=0, partida por el entrehierro si g>0 */}
      {gapVisual <= 1e-4 ? (
        <mesh position={[LEG_X, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[T, LEG_SPAN, D]} />
          {coreMaterial(saturado)}
        </mesh>
      ) : (
        [rightOffset, -rightOffset].map((y) => (
          <mesh key={y} position={[LEG_X, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[T, rightHalf, D]} />
            {coreMaterial(saturado)}
          </mesh>
        ))
      )}
    </group>
  )
}

function Coil({ turns }: { turns: number }) {
  const rings = Array.from({ length: turns }, (_, i) => {
    const y = -LEG_SPAN / 2 + 0.12 + (i / (turns - 1)) * (LEG_SPAN - 0.24)
    return (
      <mesh key={i} position={[-LEG_X, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[T / 2 + 0.075, 0.05, 12, 32]} />
        <meshStandardMaterial color={COLORS.coil} metalness={0.85} roughness={0.28} />
      </mesh>
    )
  })
  return <group>{rings}</group>
}

function Flux({ curve, radius, saturado }: { curve: THREE.CatmullRomCurve3; radius: number; saturado: boolean }) {
  const tube = useMemo(
    () => new THREE.TubeGeometry(curve, 220, radius, 18, true),
    [curve, radius],
  )
  const particles = useRef<THREE.Group>(null)
  const offset = useRef(0)
  const N_P = 6
  useFrame((_, dt) => {
    offset.current = (offset.current + dt * 0.14) % 1
    const g = particles.current
    if (!g) return
    g.children.forEach((child, i) => {
      const t = (offset.current + i / N_P) % 1
      const p = curve.getPointAt(t)
      child.position.set(p.x, p.y, p.z)
    })
  })
  const color = saturado ? '#f0a5a0' : '#bcd8ff'
  return (
    <group>
      <mesh geometry={tube}>
        <meshStandardMaterial
          color={COLORS.flux}
          emissive={COLORS.flux}
          emissiveIntensity={saturado ? 0.5 : 0.85}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={0.92}
        />
      </mesh>
      <group ref={particles}>
        {Array.from({ length: N_P }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[Math.min(0.04, radius * 0.8 + 0.012), 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Fringing({ gapVisual }: { gapVisual: number }) {
  const bulge = gapVisual * 1.1 + 0.06
  const lines = useMemo(() => {
    const out: THREE.TubeGeometry[] = []
    const zs = [-D / 4, 0, D / 4]
    for (const z of zs) {
      for (const dir of [1, -1]) {
        const x = LEG_X + dir * (T / 2)
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x, gapVisual / 2, z),
          new THREE.Vector3(x + dir * bulge, 0, z),
          new THREE.Vector3(x, -gapVisual / 2, z),
        ])
        out.push(new THREE.TubeGeometry(curve, 24, 0.012, 8, false))
      }
    }
    return out
  }, [gapVisual, bulge])
  return (
    <group>
      {lines.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color={COLORS.fringe} emissive={COLORS.fringe} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({
  turns,
  gapVisual,
  fluxRadius,
  fringing,
  saturado,
}: {
  turns: number
  gapVisual: number
  fluxRadius: number
  fringing: boolean
  saturado: boolean
}) {
  const curve = useLoopCurve()
  return (
    <group>
      <Core gapVisual={gapVisual} saturado={saturado} />
      <Coil turns={turns} />
      <Flux curve={curve} radius={fluxRadius} saturado={saturado} />
      {fringing && gapVisual > 1e-4 && <Fringing gapVisual={gapVisual} />}
      {/* Realce del entrehierro */}
      {gapVisual > 1e-4 && (
        <mesh position={[LEG_X, 0, 0]}>
          <boxGeometry args={[T * 1.02, gapVisual, D * 1.02]} />
          <meshStandardMaterial color={COLORS.gap} emissive={COLORS.gap} emissiveIntensity={0.55} transparent opacity={0.28} />
        </mesh>
      )}
    </group>
  )
}

export default function MagneticCircuitScene(props: {
  turns: number
  gapVisual: number
  fluxRadius: number
  fringing: boolean
  saturado: boolean
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [1.35, 1.0, 3.15], fov: 34, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b0d']} />
      <hemisphereLight args={['#6d7f99', '#0a0a0c', 0.6]} />
      <directionalLight position={[3, 4, 3]} intensity={1.35} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[0, 0.5, 5]} intensity={0.5} />
      <directionalLight position={[-3, 1, -2]} intensity={0.3} color="#3987e5" />

      <Suspense fallback={null}>
        <Scene {...props} />
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
        minDistance={2.2}
        maxDistance={5.5}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.7}
      />
    </Canvas>
  )
}
