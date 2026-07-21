import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { MathUtils, Vector3, type Group } from 'three'
import { annulusWedgeShape, DIMS, extrudeAxial, toRad } from './shapes'

export type Part = 'estator' | 'rotor' | 'entrehierro' | 'campo' | 'armadura'
export type Machine = 'sincrona' | 'induccion'

// Paleta «render de estudio»: hierro polar rojo, barras azules, cobre naranja
// pulido, entrehierro ámbar incandescente y realce dorado al seleccionar.
const HL = '#f6c945'
const COLORS = {
  core: '#2b2e36', // núcleo laminado
  housing: '#16181d', // carcasa exterior lisa
  shaft: '#cbd0d8', // eje de acero pulido
  copper: '#e17b2c', // devanados de cobre (naranja brillante)
  bar: '#2f6fe0', // conductores / barras (azul)
  field: '#c0392b', // zapatas polares (rojo)
  gap: '#f5a524', // entrehierro (ámbar incandescente)
} as const

function Clickable({
  onSelect,
  children,
}: {
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <group
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onSelect()
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      {children}
    </group>
  )
}

function partMat(
  base: string,
  isSel: boolean,
  opts: { metalness?: number; roughness?: number; emissive?: number } = {},
) {
  return (
    <meshStandardMaterial
      color={isSel ? HL : base}
      metalness={opts.metalness ?? 0.75}
      roughness={opts.roughness ?? 0.35}
      emissive={isSel ? HL : base}
      emissiveIntensity={isSel ? 0.45 : (opts.emissive ?? 0)}
    />
  )
}

function Machine3D({
  machine,
  part,
  onSelect,
  running,
  speed,
  reveal,
  exploded,
}: {
  machine: Machine
  part: Part
  onSelect: (p: Part) => void
  running: boolean
  speed: number
  reveal: number
  exploded: boolean
}) {
  const spinRef = useRef<Group>(null)
  const statorRef = useRef<Group>(null)
  const armatureRef = useRef<Group>(null)
  const gapRef = useRef<Group>(null)
  const fluxRef = useRef<Group>(null)

  useFrame(({ clock }, dt) => {
    if (spinRef.current) {
      if (running) spinRef.current.rotation.z += dt * 0.45 * speed
      spinRef.current.position.z = MathUtils.damp(spinRef.current.position.z, exploded ? -0.72 : 0, 5, dt)
    }
    if (statorRef.current) {
      statorRef.current.position.z = MathUtils.damp(statorRef.current.position.z, exploded ? 0.58 : 0, 5, dt)
    }
    if (armatureRef.current) {
      armatureRef.current.position.z = MathUtils.damp(armatureRef.current.position.z, exploded ? 0.28 : 0, 5, dt)
    }
    if (gapRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * (part === 'entrehierro' ? 0.018 : 0.006)
      gapRef.current.scale.set(pulse, pulse, 1)
    }
    if (fluxRef.current && running) fluxRef.current.rotation.z += dt * 0.3 * speed
  })

  const gap = machine === 'sincrona' ? DIMS.gapSync : DIMS.gapInduction
  const rotorOuterR = DIMS.statorBoreR - gap
  const coreLen = DIMS.machineLength * 0.92

  const missingHalf = (DIMS.cutawaySpanDeg * MathUtils.clamp(reveal, 0, 1)) / 2
  const visStart = toRad(DIMS.cutawayCenterDeg + missingHalf)
  const visEnd = toRad(DIMS.cutawayCenterDeg - missingHalf + 360)

  // Carcasa exterior lisa (con el mismo corte que el núcleo)
  const housingGeo = useMemo(
    () => extrudeAxial(annulusWedgeShape(DIMS.statorOuterR * 1.07, DIMS.statorOuterR * 0.99, visStart, visEnd), coreLen * 1.04),
    [visStart, visEnd, coreLen],
  )
  const statorGeo = useMemo(
    () => extrudeAxial(annulusWedgeShape(DIMS.statorOuterR, DIMS.statorBoreR, visStart, visEnd), coreLen),
    [visStart, visEnd, coreLen],
  )
  const gapGeo = useMemo(
    () =>
      extrudeAxial(
        annulusWedgeShape(rotorOuterR + gap * 0.97, rotorOuterR + gap * 0.03, 0, Math.PI * 2),
        coreLen * 0.98,
      ),
    [rotorOuterR, gap, coreLen],
  )
  const poleGeo = useMemo(
    () =>
      extrudeAxial(
        annulusWedgeShape(rotorOuterR, DIMS.hubR, toRad(-DIMS.poleArcDeg / 2), toRad(DIMS.poleArcDeg / 2)),
        coreLen * 0.94,
      ),
    [rotorOuterR, coreLen],
  )

  const isSel = (p: Part) => part === p
  const boreR = DIMS.statorBoreR - 0.02
  const endZ = (coreLen * 0.86) / 2

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {/* --- Estator: carcasa lisa + núcleo laminado --- */}
      <group ref={statorRef}>
        <Clickable onSelect={() => onSelect('estator')}>
          <mesh geometry={housingGeo} castShadow receiveShadow>
            {partMat(COLORS.housing, isSel('estator'), { metalness: 0.55, roughness: 0.5 })}
          </mesh>
          <mesh geometry={statorGeo} castShadow receiveShadow>
            {partMat(COLORS.core, isSel('estator'), { metalness: 0.72, roughness: 0.34 })}
          </mesh>
          {/* Tapas / campanas de los extremos */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0, s * (coreLen * 0.52)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[DIMS.statorOuterR * 1.03, DIMS.statorOuterR * 1.03, 0.06, 48]} />
              {partMat(COLORS.housing, isSel('estator'), { metalness: 0.6, roughness: 0.45 })}
            </mesh>
          ))}
        </Clickable>
      </group>

      {/* --- Armadura: barras azules en las ranuras + cabezas de bobina de cobre --- */}
      <group ref={armatureRef}>
        <Clickable onSelect={() => onSelect('armadura')}>
          {Array.from({ length: DIMS.slotCount }, (_, i) => {
            const a = (i / DIMS.slotCount) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[boreR * Math.cos(a), boreR * Math.sin(a), 0]}
                rotation={[Math.PI / 2, 0, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.045, 0.045, coreLen * 0.86, 10]} />
                {partMat(COLORS.bar, isSel('armadura'), { metalness: 0.6, roughness: 0.3 })}
              </mesh>
            )
          })}
          {/* Cabezas de bobina (end-turns) de cobre pulido que sobresalen del núcleo */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, 0, side * (endZ + 0.04)]} rotation={[0, 0, 0]} castShadow>
              <torusGeometry args={[boreR, 0.075, 20, 60]} />
              {partMat(COLORS.copper, isSel('armadura'), { metalness: 1, roughness: 0.16 })}
            </mesh>
          ))}
        </Clickable>
      </group>

      {/* --- Entrehierro: anillo ámbar incandescente entre rotor y estator --- */}
      <group ref={gapRef}>
        <Clickable onSelect={() => onSelect('entrehierro')}>
          <mesh geometry={gapGeo}>
            <meshStandardMaterial
              color={isSel('entrehierro') ? HL : COLORS.gap}
              emissive={isSel('entrehierro') ? HL : COLORS.gap}
              emissiveIntensity={isSel('entrehierro') ? 2.6 : 1.5}
              transparent
              opacity={isSel('entrehierro') ? 0.68 : 0.5}
              metalness={0}
              roughness={1}
              toneMapped={false}
            />
          </mesh>
          {/* Partículas que recorren el entrehierro: hacen visible el campo giratorio. */}
          <group ref={fluxRef}>
            {Array.from({ length: 18 }, (_, i) => {
              const a = (i / 18) * Math.PI * 2
              const r = rotorOuterR + gap * 0.5
              return (
                <mesh key={i} position={[r * Math.cos(a), r * Math.sin(a), (i % 3 - 1) * 0.12]}>
                  <sphereGeometry args={[isSel('entrehierro') ? 0.024 : 0.016, 8, 8]} />
                  <meshBasicMaterial color={i % 2 === 0 ? '#ffd166' : '#55e6ff'} toneMapped={false} />
                </mesh>
              )
            })}
          </group>
        </Clickable>
      </group>

      {/* --- Rotor + eje (gira) --- */}
      <group ref={spinRef}>
        <Clickable onSelect={() => onSelect('rotor')}>
          {/* Eje de acero pulido (no se realza para no inundar la escena) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[DIMS.shaftR, DIMS.shaftR, DIMS.machineLength + DIMS.shaftOverhang * 2, 32]} />
            {partMat(COLORS.shaft, false, { metalness: 0.95, roughness: 0.14 })}
          </mesh>

          {machine === 'sincrona' ? (
            <>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[DIMS.hubR, DIMS.hubR, coreLen * 0.96, 32]} />
                {partMat(COLORS.core, isSel('rotor'), { metalness: 0.72, roughness: 0.36 })}
              </mesh>
              {/* Zapatas polares rojas */}
              {[0, Math.PI].map((ang) => (
                <mesh key={ang} geometry={poleGeo} rotation={[0, 0, ang]} castShadow>
                  {partMat(COLORS.field, isSel('rotor'), { metalness: 0.35, roughness: 0.45 })}
                </mesh>
              ))}
            </>
          ) : (
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[rotorOuterR, rotorOuterR, coreLen * 0.94, 40]} />
              {partMat(COLORS.core, isSel('rotor'), { metalness: 0.72, roughness: 0.36 })}
            </mesh>
          )}
        </Clickable>

        {/* --- Campo: bobinas de cobre (síncrona) o jaula de ardilla (inducción) --- */}
        <Clickable onSelect={() => onSelect('campo')}>
          {machine === 'sincrona' ? (
            [0, Math.PI].flatMap((poleAng) => {
              const coilR = (DIMS.hubR + rotorOuterR) / 2
              // Bobinas de campo: varias vueltas de cobre a cada lado del polo
              return [-1, 1].flatMap((side) =>
                [0, 1, 2].map((turn) => {
                  const z = (side * (coreLen * 0.94)) / 2 + side * (0.03 + turn * 0.055)
                  return (
                    <mesh
                      key={`${poleAng}-${side}-${turn}`}
                      position={[coilR * Math.cos(poleAng), coilR * Math.sin(poleAng), z]}
                      rotation={[0, 0, poleAng]}
                      castShadow
                    >
                      <boxGeometry args={[(rotorOuterR - DIMS.hubR) * 0.9, 0.16, 0.05]} />
                      {partMat(COLORS.copper, isSel('campo'), { metalness: 1, roughness: 0.18 })}
                    </mesh>
                  )
                }),
              )
            })
          ) : (
            <>
              {/* Barras de la jaula (azules) */}
              {Array.from({ length: DIMS.cageBarCount }, (_, i) => {
                const a = (i / DIMS.cageBarCount) * Math.PI * 2
                const r = rotorOuterR - DIMS.cageBarR - 0.02
                return (
                  <mesh
                    key={i}
                    position={[r * Math.cos(a), r * Math.sin(a), 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    castShadow
                  >
                    <cylinderGeometry args={[DIMS.cageBarR, DIMS.cageBarR, coreLen * 1.02, 8]} />
                    {partMat(COLORS.bar, isSel('campo'), { metalness: 0.6, roughness: 0.3 })}
                  </mesh>
                )
              })}
              {/* Anillos de cortocircuito de cobre pulido */}
              {[-1, 1].map((side) => (
                <mesh key={side} position={[0, 0, (side * (coreLen * 1.02)) / 2]} castShadow>
                  <torusGeometry args={[rotorOuterR - DIMS.cageBarR - 0.02, DIMS.cageRingTube, 16, 44]} />
                  {partMat(COLORS.copper, isSel('campo'), { metalness: 1, roughness: 0.18 })}
                </mesh>
              ))}
            </>
          )}
        </Clickable>
      </group>
    </group>
  )
}

/** Lleva la cámara con suavidad hacia la pieza elegida sin quitar el control al usuario. */
function CameraDirector({
  part,
  resetSignal,
  exploded,
}: {
  part: Part
  resetSignal: number
  exploded: boolean
}) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as
    | { target: Vector3; update?: () => void; reset?: () => void }
    | null
  const goal = useRef(new Vector3(1.9, 1.35, 2.75))
  const target = useRef(new Vector3(0, 0, 0))
  const moving = useRef(false)

  useEffect(() => {
    const views: Record<Part, [number, number, number]> = {
      estator: [2.45, 1.55, 3.45],
      rotor: [1.95, 1.05, 2.75],
      entrehierro: [1.82, 0.88, 2.58],
      campo: [1.92, 0.98, 2.7],
      armadura: [2.12, 1.25, 3],
    }
    const [x, y, z] = exploded ? [2.8, 1.65, 4.05] : views[part]
    goal.current.set(x, y, z)
    target.current.set(0, 0, 0)
    moving.current = true
  }, [part, exploded])

  useEffect(() => {
    if (resetSignal > 0) {
      goal.current.set(1.9, 1.35, 2.75)
      target.current.set(0, 0, 0)
      moving.current = true
    }
  }, [resetSignal])

  useFrame((_, dt) => {
    if (!moving.current) return
    camera.position.lerp(goal.current, 1 - Math.exp(-4.5 * dt))
    if (controls) {
      controls.target.lerp(target.current, 1 - Math.exp(-5 * dt))
      controls.update?.()
    }
    if (camera.position.distanceTo(goal.current) < 0.012) moving.current = false
  })

  return null
}

/** Sombra de contacto procedural (sin texturas externas) para anclar el modelo visualmente. */
function Ground() {
  return (
    <ContactShadows position={[0, -1.15, 0]} opacity={0.6} scale={6} blur={2.4} far={1.6} resolution={512} />
  )
}

export default function MachineScene({
  machine,
  part,
  onSelect,
  resetSignal = 0,
  running = true,
  speed = 1,
  reveal = 1,
  exploded = false,
}: {
  machine: Machine
  part: Part
  onSelect: (p: Part) => void
  resetSignal?: number
  running?: boolean
  speed?: number
  reveal?: number
  exploded?: boolean
}) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.6]}
      camera={{ position: [1.9, 1.35, 2.75], fov: 38, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#07080b']} />
      <hemisphereLight args={['#7d90ac', '#08090c', 0.7]} />
      <directionalLight
        position={[3, 4, 2.5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.4} color="#3f7fe0" />
      <pointLight position={[0, 0, 2.4]} intensity={0.6} color="#f5a524" distance={6} />

      <Suspense fallback={null}>
        <Machine3D
          machine={machine}
          part={part}
          onSelect={onSelect}
          running={running}
          speed={speed}
          reveal={reveal}
          exploded={exploded}
        />
        <CameraDirector part={part} resetSignal={resetSignal} exploded={exploded} />
        <Ground />
        <Environment resolution={256} background={false}>
          <Lightformer intensity={2.4} color="#f4f4f5" position={[0, 4, 2]} scale={[8, 8, 1]} form="rect" />
          <Lightformer intensity={0.8} color="#3f7fe0" position={[-4, 1, 3]} scale={[6, 6, 1]} form="rect" />
          <Lightformer intensity={0.8} color="#f0a35a" position={[4, 0.5, -3]} scale={[6, 6, 1]} form="rect" />
        </Environment>
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.85} intensity={0.85} mipmapBlur />
        </EffectComposer>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={1.8}
        maxDistance={5}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.62}
      />
    </Canvas>
  )
}
