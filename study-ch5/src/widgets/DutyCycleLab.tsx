import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { potenciaEquivalente, thermalCycle } from '../lib/termica'

/**
 * Laboratorio — Tipos de servicio y potencia equivalente.
 * Una carga cíclica no exige el motor de su pico: exige el de su RMS
 * (las pérdidas van con P²) — siempre que el ciclo sea corto frente a τ
 * y que el pico térmico no toque el límite. Ambas condiciones se ven aquí.
 */
export default function DutyCycleLab() {
  const [p1, setP1] = useState(120) // % segmento 1
  const [t1, setT1] = useState(10) // min
  const [p2, setP2] = useState(60)
  const [t2, setT2] = useState(15)
  const [tPar, setTPar] = useState(10) // parada [min]
  const [tau, setTau] = useState(40)

  const segs = [
    { p: p1 / 100, t: t1 },
    { p: p2 / 100, t: t2 },
    { p: 0, t: tPar, parada: true },
  ]
  const peq = potenciaEquivalente(segs, 0.4)

  const termica = useMemo(
    () =>
      thermalCycle(
        [
          { pLoss: (p1 / 100) ** 2, t: t1 },
          { pLoss: (p2 / 100) ** 2, t: t2 },
          { pLoss: 0, t: tPar, parada: true },
        ],
        tau,
        tau * 2.5,
        7,
        Math.max(0.25, (t1 + t2 + tPar) / 140),
      ),
    [p1, t1, p2, t2, tPar, tau],
  )
  const thetaPico = Math.max(...termica.map((d) => d.theta))
  const cicloTotal = t1 + t2 + tPar

  const W = 640
  const H = 190
  const tEnd = termica[termica.length - 1].t
  const yMax = Math.max(1.3, thetaPico * 1.15)
  const xOf = (t: number) => 40 + (t / tEnd) * (W - 52)
  const yOf = (v: number) => H - 26 - (v / yMax) * (H - 42)

  // Perfil de potencia (escalones) para un ciclo de referencia
  const perfil: string[] = []
  let tAcc = 0
  for (let c = 0; c < 7; c++) {
    for (const s of [{ p: p1 / 100, t: t1 }, { p: p2 / 100, t: t2 }, { p: 0, t: tPar }]) {
      perfil.push(`${xOf(tAcc)},${yOf(s.p)} ${xOf(tAcc + s.t)},${yOf(s.p)}`)
      tAcc += s.t
    }
    if (tAcc > tEnd) break
  }

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Ciclo de servicio: dimensionar por el RMS, verificar por el pico
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-3">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-amber-300">Tramo 1</span>
          <input type="range" min={40} max={160} step={5} value={p1} onChange={(e) => setP1(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{p1} %</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-14">durante</span>
          <input type="range" min={5} max={40} step={5} value={t1} onChange={(e) => setT1(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{t1} min</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-16">τ térmica</span>
          <input type="range" min={15} max={80} step={5} value={tau} onChange={(e) => setTau(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{tau} min</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-sky-300">Tramo 2</span>
          <input type="range" min={20} max={120} step={5} value={p2} onChange={(e) => setP2(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{p2} %</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-14">durante</span>
          <input type="range" min={5} max={40} step={5} value={t2} onChange={(e) => setT2(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{t2} min</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-16 font-semibold text-zinc-300">Parada</span>
          <input type="range" min={0} max={40} step={5} value={tPar} onChange={(e) => setTPar(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{tPar} min</span>
        </label>
      </div>

      <div className="px-2 py-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={40} y1={yOf(1)} x2={W - 12} y2={yOf(1)} stroke="#f87171" strokeDasharray="5 4" strokeWidth={1.2} />
          <text x={W - 14} y={yOf(1) - 4} fill="#f87171" fontSize={8.5} textAnchor="end">límite térmico</text>
          {/* Perfil de potencia */}
          {perfil.map((seg) => (
            <polyline key={seg} points={seg} fill="none" stroke="#38bdf8" strokeWidth={1.2} opacity={0.55} />
          ))}
          {/* Temperatura */}
          <polyline points={termica.map((d) => `${xOf(d.t)},${yOf(d.theta)}`).join(' ')} fill="none" stroke="#f59e0b" strokeWidth={2} />
          <text x={46} y={yOf(p1 / 100) - 5} fill="#38bdf8" fontSize={8.5}>P(t)</text>
          <text x={46} y={22} fill="#f59e0b" fontSize={8.5}>θ(t)</text>
          <text x={W / 2} y={H - 2} fill="#71717a" fontSize={8.5} textAnchor="middle">tiempo [min] · 7 ciclos de {cicloTotal} min</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">P equivalente (rms)</p>
          <p className={`font-mono text-sm font-semibold ${peq > 1 ? 'text-red-300' : 'text-emerald-300'}`}>
            {(peq * 100).toFixed(0)} % {peq > 1 ? '⚠' : '✓'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">θ pico simulada</p>
          <p className={`font-mono text-sm font-semibold ${thetaPico > 1.02 ? 'text-red-300' : 'text-emerald-300'}`}>
            {(thetaPico * 100).toFixed(0)} % {thetaPico > 1.02 ? '⚠' : '✓'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Ciclo vs τ</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">
            {cicloTotal} / {tau} min {cicloTotal < tau ? '(RMS válido)' : '(¡verificar por θ!)'}
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) 120 %/10 min + 60 %/15 min + 10 min parado: P_eq ≈ 90 % — un motor del 100 % lo lleva
        aunque el pico sea 120: las pérdidas promedian en P² (servicio S3 de libro); (2) alarga el
        tramo 1 a 40 min con τ = 15: el RMS sigue diciendo «apto» pero la θ pico CRUZA el límite —
        el método RMS solo vale si el ciclo es corto frente a τ (por eso la tercera tarjeta te
        vigila); (3) la parada pondera MENOS en el denominador (ventilación reducida, factor 0.4):
        quita la parada y mira el P_eq subir menos de lo que esperabas; (4) definición de los
        servicios IEC: S1 = continuo (el escalón del laboratorio anterior), S2 = tiempo limitado,
        S3 = este ciclo periódico — la placa promete SOLO el servicio que declara.
      </footer>
    </div>
  )
}
