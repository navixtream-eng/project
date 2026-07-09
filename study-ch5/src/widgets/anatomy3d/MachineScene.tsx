import { Suspense, useMemo, useRef } from 'react'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import type { Group } from 'three'
import { annulusWedgeShape, DIMS, extrudeAxial, toRad } from './shapes'

export type Part = 'estator' | 'rotor' | 'entrehierro' | 'campo' | 'armadura'
export type Machine = 'sincrona' | 'induccion'

const HL = '#c98500'
const COLORS = { steel: '#27272a', edge: '#52525b', copper: '#3987e5', field: '#e66767', gap: '#199e70' }
const CAGE_COLOR = '#9085e9'

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

function partMat(base: string, isSel: boolean, opts: { metalness?: number; roughness?: number } = {}) {
  return (
    <meshStandardMaterial
      color={isSel ? HL : base}
      metalness={opts.metalness ?? 0.75}
      roughness={opts.roughness ?? 0.35}
      emissive={isSel ? HL : '#000000'}
      emissiveIntensity={isSel ? 0.32 : 0}
    />
  )
}

function Machine3D({
  machine,
  part,
  onSelect,
}: {
  machine: Machine
  part: Part
  onSelect: (p: Part) => void
}) {
  const spinRef = useRef<Group>(null)
  useFrame((_, dt) => {
    if (spinRef.current) spinRef.current.rotation.z += dt * 0.45
  })

  const gap = machine === 'sincrona' ? DIMS.gapSync : DIMS.gapInduction
  const rotorOuterR = DIMS.statorBoreR - gap
  const coreLen = DIMS.machineLength * 0.92

  const missingHalf = DIMS.cutawaySpanDeg / 2
  const visStart = toRad(DIMS.cutawayCenterDeg + missingHalf)
  const visEnd = toRad(DIMS.cutawayCenterDeg - missingHalf + 360)

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

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {/* --- Estator (fijo) --- */}
      <Clickable onSelect={() => onSelect('estator')}>
        <mesh geometry={statorGeo} castShadow receiveShadow>
          {partMat(COLORS.steel, isSel('estator'), { metalness: 0.65, roughness: 0.42 })}
        </mesh>
      </Clickable>

      {/* --- Armadura: conductores en las ranuras del estator --- */}
      <Clickable onSelect={() => onSelect('armadura')}>
        {Array.from({ length: DIMS.slotCount }, (_, i) => {
          const a = (i / DIMS.slotCount) * Math.PI * 2
          const r = DIMS.statorBoreR - 0.02
          return (
            <mesh
              key={i}
              position={[r * Math.cos(a), r * Math.sin(a), 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.045, 0.045, coreLen * 0.86, 10]} />
              {partMat(COLORS.copper, isSel('armadura'), { metalness: 0.85, roughness: 0.28 })}
            </mesh>
          )
        })}
      </Clickable>

      {/* --- Entrehierro: anillo delgado y emisivo entre rotor y estator --- */}
      <Clickable onSelect={() => onSelect('entrehierro')}>
        <mesh geometry={gapGeo}>
          <meshStandardMaterial
            color={isSel('entrehierro') ? HL : COLORS.gap}
            emissive={isSel('entrehierro') ? HL : COLORS.gap}
            emissiveIntensity={isSel('entrehierro') ? 1.1 : 0.55}
            transparent
            opacity={isSel('entrehierro') ? 0.65 : 0.4}
            metalness={0}
            roughness={1}
          />
        </mesh>
      </Clickable>

      {/* --- Rotor + eje (gira) --- */}
      <group ref={spinRef}>
        <Clickable onSelect={() => onSelect('rotor')}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[DIMS.shaftR, DIMS.shaftR, DIMS.machineLength + DIMS.shaftOverhang * 2, 24]} />
            {partMat(COLORS.edge, false, { metalness: 0.9, roughness: 0.22 })}
          </mesh>

          {machine === 'sincrona' ? (
            <>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[DIMS.hubR, DIMS.hubR, coreLen * 0.96, 32]} />
                {partMat(COLORS.steel, isSel('rotor'), { metalness: 0.7, roughness: 0.38 })}
              </mesh>
              {[0, Math.PI].map((ang) => (
                <mesh key={ang} geometry={poleGeo} rotation={[0, 0, ang]} castShadow>
                  {partMat(COLORS.steel, isSel('rotor'), { metalness: 0.7, roughness: 0.38 })}
                </mesh>
              ))}
            </>
          ) : (
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[rotorOuterR, rotorOuterR, coreLen * 0.94, 40]} />
              {partMat(COLORS.steel, isSel('rotor'), { metalness: 0.7, roughness: 0.38 })}
            </mesh>
          )}
        </Clickable>

        {/* --- Campo: bobinas (síncrona) o jaula de ardilla (inducción) --- */}
        <Clickable onSelect={() => onSelect('campo')}>
          {machine === 'sincrona' ? (
            [0, Math.PI].flatMap((poleAng) =>
              [-1, 1].map((side) => {
                const coilR = (DIMS.hubR + rotorOuterR) / 2
                const z = (side * (coreLen * 0.94)) / 2 + side * 0.03
                return (
                  <mesh
                    key={`${poleAng}-${side}`}
                    position={[coilR * Math.cos(poleAng), coilR * Math.sin(poleAng), z]}
                    rotation={[0, 0, poleAng]}
                    castShadow
                  >
                    <boxGeometry args={[(rotorOuterR - DIMS.hubR) * 0.82, 0.15, 0.09]} />
                    {partMat(COLORS.field, isSel('campo'), { metalness: 0.15, roughness: 0.55 })}
                  </mesh>
                )
              }),
            )
          ) : (
            <>
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
                    {partMat(CAGE_COLOR, isSel('campo'), { metalness: 0.8, roughness: 0.3 })}
                  </mesh>
                )
              })}
              {[-1, 1].map((side) => (
                <mesh key={side} position={[0, 0, (side * (coreLen * 1.02)) / 2]} castShadow>
                  <torusGeometry args={[rotorOuterR - DIMS.cageBarR - 0.02, DIMS.cageRingTube, 12, 40]} />
                  {partMat(CAGE_COLOR, isSel('campo'), { metalness: 0.8, roughness: 0.3 })}
                </mesh>
              ))}
            </>
          )}
        </Clickable>
      </group>
    </group>
  )
}

/** Sombra de contacto procedural (sin texturas externas) para anclar el modelo visualmente. */
function Ground() {
  return (
    <ContactShadows position={[0, -1.15, 0]} opacity={0.55} scale={6} blur={2.4} far={1.6} resolution={512} />
  )
}

export default function MachineScene({
  machine,
  part,
  onSelect,
}: {
  machine: Machine
  part: Part
  onSelect: (p: Part) => void
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [1.9, 1.35, 2.75], fov: 38, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b0d']} />
      <hemisphereLight args={['#6d7f99', '#0a0a0c', 0.65]} />
      <directionalLight
        position={[3, 4, 2.5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.35} color="#3987e5" />

      <Suspense fallback={null}>
        <Machine3D machine={machine} part={part} onSelect={onSelect} />
        <Ground />
        <Environment resolution={256} background={false}>
          <Lightformer intensity={2.2} color="#f4f4f5" position={[0, 4, 2]} scale={[8, 8, 1]} form="rect" />
          <Lightformer intensity={0.7} color="#3987e5" position={[-4, 1, 3]} scale={[6, 6, 1]} form="rect" />
          <Lightformer intensity={0.7} color="#c98500" position={[4, 0.5, -3]} scale={[6, 6, 1]} form="rect" />
        </Environment>
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
