import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import TransformerScene from './anatomy3d/TransformerScene'

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
        <div className="relative h-72 w-full max-w-md shrink-0 touch-none sm:h-80">
          <TransformerScene turns1={turns1} turns2={turns2} />
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-zinc-400">
            arrastra para rotar · <span className="text-sky-300">V₁,N₁</span> · φ compartido (verde) · <span className="text-amber-300">V₂,N₂</span> → Z
          </span>
          <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-zinc-500">
            ideal: μ→∞, R = 0, sin dispersión
          </span>
        </div>

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
