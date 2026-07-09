import * as THREE from 'three'

/**
 * Dimensiones del modelo 3D (unidades arbitrarias, ~metros a escala de
 * juguete). Un solo lugar para ajustar proporciones sin tocar geometría.
 */
export const DIMS = {
  statorOuterR: 1.05,
  statorBoreR: 0.62,
  gapSync: 0.055,
  gapInduction: 0.035,
  hubR: 0.3,
  poleArcDeg: 60,
  machineLength: 1.5,
  shaftR: 0.11,
  shaftOverhang: 0.62,
  cageBarR: 0.038,
  cageBarCount: 20,
  cageRingTube: 0.05,
  slotCount: 24,
  // El corte (cuña faltante) se centra en este ángulo LOCAL (plano XY, antes
  // de rotar el grupo) para que, tras group.rotation.y = 90°, quede mirando
  // hacia la cámara por defecto. Ajustado empíricamente con capturas.
  cutawayCenterDeg: 150,
  cutawaySpanDeg: 100,
} as const

export const toRad = (deg: number) => (deg * Math.PI) / 180

/**
 * Cuña de anillo en el plano XY (arco exterior + dos lados rectos + arco
 * interior), lista para extruir a lo largo de Z. Con angleStart=0,
 * angleEnd=2π da un anillo completo; con inner=0 da una cuña maciza.
 */
export function annulusWedgeShape(
  rOuter: number,
  rInner: number,
  angleStart: number,
  angleEnd: number,
): THREE.Shape {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, rOuter, angleStart, angleEnd, false)
  if (rInner > 1e-6) {
    shape.lineTo(rInner * Math.cos(angleEnd), rInner * Math.sin(angleEnd))
    shape.absarc(0, 0, rInner, angleEnd, angleStart, true)
  } else {
    shape.lineTo(0, 0)
  }
  shape.closePath()
  return shape
}

/** Extruye una forma XY a lo largo de Z, centrada en el origen del eje. */
export function extrudeAxial(shape: THREE.Shape, length: number, segments = 48): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false, curveSegments: segments })
  geo.translate(0, 0, -length / 2)
  geo.computeVertexNormals()
  return geo
}
