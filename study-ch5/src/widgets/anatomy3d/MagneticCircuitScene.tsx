import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'

// Paleta «render de estudio»: acero laminado, cobre pulido, flujo azul
// incandescente y franjeo violeta.
const COLORS = {
  coreA: '#34373e', // lámina clara
  coreB: '#26282e', // lámina oscura (alternada)
  coil: '#c46a2b', // cobre pulido
  lead: '#1b1c20', // puntas aisladas de los terminales
  flux: '#3aa0ff', // lazo de flujo
  gap: '#e66767', // realce del entrehierro
  fringe: '#a78bfa', // franjeo
} as const

// Marco cuadrado (unidades arbitrarias). El eje del núcleo mira a +Z.
const W = 1.0 // semiancho exterior
const H = 1.0 // semialto exterior
const T = 0.34 // espesor de pierna (sección cuadrada T×T)
const D = 0.34 // profundidad en Z
const LEG_X = W - T / 2 // x del centro de las piernas verticales
const LEG_SPAN = 2 * (H - T) // largo útil de las piernas verticales
const Z_FLUX = D / 2 + 0.02 // el lazo de flujo flota sobre la cara frontal
const NLAM = 11 // láminas apiladas a lo largo de Z

function coreColor(i: number, saturado: boolean) {
  if (saturado) return i % 2 === 0 ? '#8a4038' : '#6f3029'
  return i % 2 === 0 ? COLORS.coreA : COLORS.coreB
}

/**
 * Pierna del núcleo como pila de láminas delgadas a lo largo de Z: las
 * juntas atrapan la luz y dan el aspecto de acero laminado del render.
 */
function LaminatedLeg({
  position,
  width,
  height,
  saturado,
}: {
  position: [number, number, number]
  width: number
  height: number
  saturado: boolean
}) {
  const lam = D / NLAM
  return (
    <group position={position}>
      {Array.from({ length: NLAM }, (_, i) => (
        <mesh key={i} position={[0, 0, -D / 2 + lam * (i + 0.5)]} castShadow receiveShadow>
          <boxGeometry args={[width, height, lam * 0.88]} />
          <meshStandardMaterial
            color={coreColor(i, saturado)}
            metalness={0.72}
            roughness={0.34}
            emissive={saturado ? '#d8451c' : '#000000'}
            emissiveIntensity={saturado ? 0.25 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

function Core({ gapVisual, saturado }: { gapVisual: number; saturado: boolean }) {
  const rightHalf = (LEG_SPAN - gapVisual) / 2
  const rightOffset = gapVisual / 2 + rightHalf / 2

  return (
    <group>
      {/* Piernas superior e inferior (horizontales, ancho completo) */}
      {[H - T / 2, -(H - T / 2)].map((y) => (
        <LaminatedLeg key={y} position={[0, y, 0]} width={2 * W} height={T} saturado={saturado} />
      ))}
      {/* Pierna izquierda (bajo la bobina) */}
      <LaminatedLeg position={[-LEG_X, 0, 0]} width={T} height={LEG_SPAN} saturado={saturado} />
      {/* Pierna derecha: entera si g=0, partida por el entrehierro si g>0 */}
      {gapVisual <= 1e-4 ? (
        <LaminatedLeg position={[LEG_X, 0, 0]} width={T} height={LEG_SPAN} saturado={saturado} />
      ) : (
        [rightOffset, -rightOffset].map((y) => (
          <LaminatedLeg key={y} position={[LEG_X, y, 0]} width={T} height={rightHalf} saturado={saturado} />
        ))
      )}
    </group>
  )
}

/** Bobina helicoidal continua de cobre pulido con terminales que salen a la izquierda. */
function Coil({ turns }: { turns: number }) {
  const R = 0.31 // radio de la hélice (libra la pierna T×D en diagonal)
  const WIRE = 0.056
  const span = LEG_SPAN - 0.34

  const { helixGeo, start, end } = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const steps = turns * 32
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const ang = t * turns * Math.PI * 2
      pts.push(
        new THREE.Vector3(
          -LEG_X + R * Math.sin(ang),
          -span / 2 + t * span,
          R * Math.cos(ang),
        ),
      )
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    return {
      helixGeo: new THREE.TubeGeometry(curve, steps, WIRE, 14, false),
      start: pts[0],
      end: pts[pts.length - 1],
    }
  }, [turns, span])

  const leadGeos = useMemo(() => {
    const mk = (p: THREE.Vector3, up: number) => {
      const curve = new THREE.CatmullRomCurve3([
        p.clone(),
        new THREE.Vector3(p.x - 0.28, p.y + up * 0.05, p.z + 0.08),
        new THREE.Vector3(p.x - 0.52, p.y + up * 0.1, p.z + 0.12),
      ])
      return new THREE.TubeGeometry(curve, 16, WIRE * 0.82, 10, false)
    }
    return [mk(start, -1), mk(end, 1)]
  }, [start, end])

  const copper = (
    <meshStandardMaterial color={COLORS.coil} metalness={1} roughness={0.18} />
  )

  return (
    <group>
      <mesh geometry={helixGeo} castShadow>
        {copper}
      </mesh>
      {leadGeos.map((geo, i) => {
        const p = i === 0 ? start : end
        const up = i === 0 ? -1 : 1
        return (
          <group key={i}>
            <mesh geometry={geo} castShadow>
              {copper}
            </mesh>
            {/* Punta aislada del terminal */}
            <mesh
              position={[p.x - 0.56, p.y + up * 0.11, p.z + 0.125]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[WIRE * 0.95, WIRE * 0.95, 0.14, 12]} />
              <meshStandardMaterial color={COLORS.lead} metalness={0.35} roughness={0.55} />
            </mesh>
          </group>
        )
      })}
    </group>
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

function Flux({ curve, radius, saturado }: { curve: THREE.CatmullRomCurve3; radius: number; saturado: boolean }) {
  const tube = useMemo(
    () => new THREE.TubeGeometry(curve, 220, radius, 18, true),
    [curve, radius],
  )
  // Flechas de sentido sobre el lazo (conos orientados por la tangente)
  const arrows = useMemo(() => {
    const ts = [0.06, 0.31, 0.56, 0.81]
    return ts.map((t) => {
      const p = curve.getPointAt(t)
      const tan = curve.getTangentAt(t)
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan)
      return { p, q }
    })
  }, [curve])
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
          emissiveIntensity={saturado ? 0.7 : 1.15}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={0.92}
        />
      </mesh>
      {arrows.map(({ p, q }, i) => (
        <mesh key={i} position={p} quaternion={q}>
          <coneGeometry args={[radius * 2.4, radius * 5, 14]} />
          <meshStandardMaterial
            color={COLORS.flux}
            emissive={COLORS.flux}
            emissiveIntensity={1.1}
          />
        </mesh>
      ))}
      <group ref={particles}>
        {Array.from({ length: N_P }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[Math.min(0.04, radius * 0.8 + 0.012), 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Abanico de líneas violetas que se «desparraman» por los bordes del gap. */
function Fringing({ gapVisual }: { gapVisual: number }) {
  const lines = useMemo(() => {
    const out: THREE.TubeGeometry[] = []
    const zs = [-D * 0.38, -D / 5, 0, D / 5, D * 0.38]
    for (const [zi, z] of zs.entries()) {
      for (const dir of [1, -1]) {
        const bulge = gapVisual * (0.85 + 0.18 * (zi % 3)) + 0.06
        const x = LEG_X + dir * (T / 2)
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x, gapVisual / 2, z),
          new THREE.Vector3(x + dir * bulge, 0, z),
          new THREE.Vector3(x, -gapVisual / 2, z),
        ])
        out.push(new THREE.TubeGeometry(curve, 24, 0.011, 8, false))
      }
    }
    return out
  }, [gapVisual])
  return (
    <group>
      {lines.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial
            color={COLORS.fringe}
            emissive={COLORS.fringe}
            emissiveIntensity={1.05}
            transparent
            opacity={0.92}
          />
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
          <meshStandardMaterial color={COLORS.gap} emissive={COLORS.gap} emissiveIntensity={0.8} transparent opacity={0.3} />
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
      <hemisphereLight args={['#7d90ac', '#0a0a0c', 0.65]} />
      <directionalLight position={[3, 4, 3]} intensity={1.45} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[0, 0.5, 5]} intensity={0.55} />
      <directionalLight position={[-3, 1, -2]} intensity={0.35} color="#3987e5" />
      <pointLight position={[-1.6, 0, 1.6]} intensity={0.5} color="#f0a35a" distance={5} />

      <Suspense fallback={null}>
        <Scene {...props} />
        <ContactShadows position={[0, -1.15, 0]} opacity={0.55} scale={5} blur={2.3} far={1.5} resolution={512} />
        <Environment resolution={256} background={false}>
          <Lightformer intensity={2.2} color="#f4f4f5" position={[0, 4, 3]} scale={[7, 7, 1]} form="rect" />
          <Lightformer intensity={0.7} color="#3987e5" position={[-4, 1, 3]} scale={[5, 5, 1]} form="rect" />
          <Lightformer intensity={0.7} color="#f0a35a" position={[4, 0.5, -2]} scale={[5, 5, 1]} form="rect" />
        </Environment>
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.85} intensity={0.8} mipmapBlur />
        </EffectComposer>
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
