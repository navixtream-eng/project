import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

/** Paleta validada: primario azul, secundario amarillo, núcleo/flujo */
const COLORS = { core: '#27272a', edge: '#52525b', p: '#3987e5', s: '#c98500', flux: '#199e70' }

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El transformador ideal: la palanca de la electricidad.
 * Mismo flujo enlaza ambos devanados ⇒ los voltios por vuelta son iguales
 * ⇒ V escala con N. La potencia no se crea ni destruye ⇒ I escala al revés.
 * Y una carga vista a través de la palanca parece a² veces más grande.
 */
export default function IdealTransformerLab() {
  const [N1, setN1] = useState(1000)
  const [N2, setN2] = useState(100)
  const [V1, setV1] = useState(2400)
  const [ZL, setZL] = useState(1.2)

  const a = N1 / N2
  const V2 = V1 / a
  const I2 = V2 / ZL
  const I1 = I2 / a
  const S = V2 * I2
  const Zref = a * a * ZL
  const vPerTurn = V1 / N1

  // Dibujo: número de espiras visibles proporcional
  const turns1 = Math.max(3, Math.round(N1 / 125))
  const turns2 = Math.max(2, Math.round(N2 / 25))

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El transformador ideal — la palanca de voltios y amperes
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-sky-300">N₁ (primario)</span>
          <input type="range" min={200} max={2000} step={50} value={N1}
            onChange={(e) => setN1(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{N1}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-amber-300">N₂ (secundario)</span>
          <input type="range" min={25} max={500} step={25} value={N2}
            onChange={(e) => setN2(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{N2}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-sky-300">V₁</span>
          <input type="range" min={240} max={4800} step={60} value={V1}
            onChange={(e) => setV1(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{V1} V</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-emerald-300">Z carga</span>
          <input type="range" min={0.5} max={20} step={0.1} value={ZL}
            onChange={(e) => setZL(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{ZL.toFixed(1)} Ω</span>
        </label>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <svg viewBox="0 0 360 220" className="w-full max-w-md shrink-0 select-none">
          {/* Núcleo */}
          <path d="M 120 25 H 240 V 195 H 120 Z M 155 60 H 205 V 160 H 155 Z"
            fill={COLORS.core} stroke={COLORS.edge} strokeWidth={1.5} fillRule="evenodd" />
          {/* Flujo compartido */}
          <path d="M 137 42 H 222 V 178 H 137 Z" fill="none" stroke={COLORS.flux}
            strokeWidth={2.5} strokeDasharray="6 4" opacity={0.8} />
          <text x={165} y={38} fill={COLORS.flux} fontSize={11} fontWeight={700}>φ compartido</text>
          {/* Devanado primario */}
          {Array.from({ length: turns1 }, (_, k) => (
            <rect key={`p${k}`} x={106} y={62 + (k * 96) / turns1} width={30} height={Math.max(4, 80 / turns1)}
              rx={3} fill={COLORS.p} opacity={0.9} />
          ))}
          <text x={60} y={115} fill={COLORS.p} fontSize={12} fontWeight={700}>V₁, N₁</text>
          {/* Devanado secundario */}
          {Array.from({ length: turns2 }, (_, k) => (
            <rect key={`s${k}`} x={224} y={62 + (k * 96) / turns2} width={30} height={Math.max(4, 80 / turns2)}
              rx={3} fill={COLORS.s} opacity={0.9} />
          ))}
          <text x={264} y={115} fill={COLORS.s} fontSize={12} fontWeight={700}>V₂, N₂</text>
          {/* Carga */}
          <line x1={254} y1={70} x2={318} y2={70} stroke={COLORS.edge} strokeWidth={1.5} />
          <line x1={254} y1={150} x2={318} y2={150} stroke={COLORS.edge} strokeWidth={1.5} />
          <rect x={306} y={82} width={24} height={56} rx={4} fill="none" stroke="#10b981" strokeWidth={2} />
          <text x={300} y={177} fill="#10b981" fontSize={11} fontWeight={700}>Z carga</text>
          <text x={124} y={212} fill="#71717a" fontSize={10}>
            ideal: μ→∞, R = 0, sin dispersión
          </text>
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3 lg:grid-cols-3">
          <Readout label="a = N₁/N₂" value={a.toFixed(2)} accent="text-emerald-300" />
          <Readout label="Voltios por vuelta" value={`${vPerTurn.toFixed(2)} V/v`} accent="text-violet-300" />
          <Readout label="V₂ = V₁/a" value={`${V2.toFixed(0)} V`} accent="text-amber-300" />
          <Readout label="I₂ = V₂/Z" value={`${I2.toFixed(1)} A`} accent="text-amber-300" />
          <Readout label="I₁ = I₂/a" value={`${I1.toFixed(2)} A`} accent="text-sky-300" />
          <Readout label="Z vista desde 1: a²·Z" value={`${Zref.toFixed(0)} Ω`} />
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 lg:col-span-3">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Potencia (invariante: la palanca no crea energía)</p>
            <p className="font-mono text-sm font-semibold text-zinc-100">
              S₁ = V₁·I₁ = {(V1 * I1 / 1000).toFixed(2)} kVA&nbsp;&nbsp;=&nbsp;&nbsp;S₂ = V₂·I₂ = {(S / 1000).toFixed(2)} kVA ✓
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) mira el readout violeta: los VOLTIOS POR VUELTA son idénticos en ambos lados — es el mismo
        φ para todos, y Faraday cobra por vuelta (esa es TODA la física del transformador ideal);
        (2) duplica N₂: V₂ se duplica, I₂ cae, y S₁ = S₂ ni se inmuta — voltios y amperes se
        intercambian como fuerza y distancia en una palanca; (3) mira «Z vista desde 1»: la carga
        aparece a² veces más grande — baja la carga a 0.5 Ω con a = 10 y el primario la ve de 50 Ω,
        el truco del acoplamiento de impedancias.
      </footer>
    </div>
  )
}
