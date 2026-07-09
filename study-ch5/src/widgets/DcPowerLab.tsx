import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_DC, dcPowerFlow, fmt } from '../lib/machine'

/** Paleta validada: entrada azul, desarrollada violeta, salida emerald, pérdidas rojo/ámbar/gris */
const C = { in: '#3987e5', dev: '#9085e9', out: '#34d399', cu: '#e66767', core: '#e2761f', mech: '#71717a' }

const W = 520
const X0 = 12
const BARW = W - 150
const BH = 20

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Flujo de potencia y pérdidas de la máquina de CC.
 * Como motor: entra potencia eléctrica, paga cobre de armadura y campo, se
 * convierte en Ea·Ia, y tras las pérdidas rotacionales e indeterminadas sale
 * por el eje. Como generador, el balance se invierte.
 */
export default function DcPowerLab() {
  const [Ia, setIa] = useState(40)
  const [gen, setGen] = useState(false)
  const p = DEFAULT_DC
  const r = dcPowerFlow('shunt', p, Ia, gen)

  const top = Math.max(r.Pin, r.Pout, 1)
  const scale = BARW / top
  const bar = (x: number) => Math.max(0, x * scale)

  const rows = gen
    ? [
        { y: 22, label: 'P mecánica (entra)', power: r.Pin, color: C.in, loss: `↓ − stray ${(r.Pstray / 1000).toFixed(1)}k` },
        { y: 60, label: 'P desarrollada Ea·Ia', power: r.Pdev, color: C.dev, loss: `↓ − núcleo+fricción ${((r.Pcore + r.Pmech) / 1000).toFixed(1)}k` },
        { y: 98, label: 'P eléctrica bruta', power: r.Pdev - r.PcuArm + r.PcuArm, color: C.dev, loss: `↓ − cobre armadura ${(r.PcuArm / 1000).toFixed(2)}k` },
        { y: 136, label: 'P eléctrica (salida)', power: r.Pout, color: C.out },
      ]
    : [
        { y: 22, label: 'P entrada Vt·(Ia+If)', power: r.Pin, color: C.in, loss: `↓ − cobre arm.+campo ${((r.PcuArm + r.Pfield) / 1000).toFixed(2)}k` },
        { y: 60, label: 'P desarrollada Ea·Ia', power: r.Pdev, color: C.dev, loss: `↓ − núcleo ${(r.Pcore / 1000).toFixed(2)}k` },
        { y: 98, label: 'P mecánica bruta', power: r.Pdev - r.Pcore, color: C.dev, loss: `↓ − fricción+stray ${((r.Pmech + r.Pstray) / 1000).toFixed(2)}k` },
        { y: 136, label: 'P eje (salida)', power: r.Pout, color: C.out },
      ]

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Flujo de potencia, pérdidas y rendimiento
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <div className="flex gap-1.5">
          {[['Motor', false], ['Generador', true]].map(([label, g]) => (
            <button key={String(g)} type="button" onClick={() => setGen(g as boolean)}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                gen === g ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/50' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {label as string}
            </button>
          ))}
        </div>
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-zinc-300">Carga · Ia</span>
          <input type="range" min={2} max={80} step={1} value={Ia} onChange={(e) => setIa(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{Ia} A</span>
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <svg viewBox={`0 0 ${W} 172`} className="w-full shrink-0 select-none sm:max-w-lg">
          {rows.map((row) => (
            <g key={row.label}>
              <rect x={X0} y={row.y} width={bar(row.power)} height={BH} rx={3} fill={row.color} opacity={0.85} />
              <text x={X0 + 6} y={row.y + 14} fill="#0b0b0d" fontSize={10} fontWeight={700}>{row.label}</text>
              <text x={X0 + bar(row.power) + 6} y={row.y + 14} fill={row.color} fontSize={10} fontWeight={700}>
                {(row.power / 1000).toFixed(1)} kW
              </text>
              {row.loss && <text x={X0 + 8} y={row.y + BH + 12} fill={C.cu} fontSize={9}>{row.loss}W</text>}
            </g>
          ))}
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <Readout label="Ea (FEM)" value={`${fmt(r.Ea, 0)} V`} accent="text-sky-300" />
          <Readout label="P desarrollada Ea·Ia" value={`${fmt(r.Pdev / 1000, 1)} kW`} accent="text-violet-300" />
          <Readout label="Cobre armadura I²R" value={`${fmt(r.PcuArm, 0)} W`} accent="text-red-300" />
          <Readout label="Núcleo + mecánicas" value={`${fmt((r.Pcore + r.Pmech), 0)} W`} accent="text-orange-300" />
          <Readout label={gen ? 'P eléctrica salida' : 'P eje salida'} value={`${fmt(r.Pout / 1000, 1)} kW`} />
          <Readout label="Rendimiento η" value={`${fmt(r.eff * 100, 1)} %`}
            accent={r.eff > 0.85 ? 'text-emerald-300' : r.eff > 0.6 ? 'text-amber-300' : 'text-red-400'} />
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) como <span className="text-orange-300">motor</span>, la potencia entra eléctrica y sale por
        el eje; el «corazón» de la conversión es <span className="text-violet-300">Ea·Ia</span> (potencia
        desarrollada en el entrehierro); (2) sube la carga: las pérdidas de cobre (I²R) crecen con el
        CUADRADO de Ia, así que el rendimiento cae a plena carga y también en vacío (dominan las fijas)
        — el pico está en medio; (3) pasa a <span className="text-orange-300">generador</span>: el mismo
        árbol de pérdidas, pero recorrido al revés — entra potencia mecánica y sale eléctrica.
      </footer>
    </div>
  )
}
