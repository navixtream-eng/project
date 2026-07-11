import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { abs, cx } from '../lib/machine'
import { type FaultKind, solveFault } from '../lib/secuencias'

// Sistema fijo del ejercicio (pu): generador aterrizado con reactor pequeño
const X1 = 0.2
const X0 = 0.08

/** Curva IEC inversa estándar: t = TMS·0.14/((M)^0.02 − 1), M = I/I_pickup. */
const tIEC = (I: number, pickup: number, tms: number): number | null => {
  const M = I / pickup
  if (M <= 1.05) return null
  return (tms * 0.14) / (Math.pow(M, 0.02) - 1)
}

const TIPOS: { id: FaultKind; label: string }[] = [
  { id: '3f', label: '3φ' },
  { id: 'll', label: 'L-L' },
  { id: 'slg', label: 'SLG' },
  { id: 'llg', label: 'LLG' },
]

/**
 * Laboratorio — El relé de tierra 51N y la coordinación.
 * El relé de FASE ve la corriente de fase; el de TIERRA ve el residual 3I₀.
 * Cambia el tipo de falla y su impedancia: descubrirás por qué hacen falta
 * LOS DOS, con ajustes muy distintos, y qué es coordinar sus curvas.
 */
export default function GroundRelayLab() {
  const [kind, setKind] = useState<FaultKind>('slg')
  const [zf, setZf] = useState(5) // % resistencia de falla
  const [puF, setPuF] = useState(150) // pickup fase, % de In (In = 1 pu de carga)
  const [puN, setPuN] = useState(20) // pickup tierra, % de In
  const [tmsF, setTmsF] = useState(20) // TMS ×100
  const [tmsN, setTmsN] = useState(10)

  const sol = solveFault({
    kind,
    E: 1,
    Z1: cx(0, X1),
    Z2: cx(0, X1),
    Z0: cx(0, X0),
    Zf: cx(zf / 100, 0),
    Zn: cx(0, 0),
  })
  const iFase = Math.max(abs(sol.phaseI.a), abs(sol.phaseI.b), abs(sol.phaseI.c))
  const iRes = sol.iResidual
  const tFase = tIEC(iFase, puF / 100, tmsF / 100)
  const tTierra = tIEC(iRes, puN / 100, tmsN / 100)

  // --- Curvas TCC en canvas-log (SVG 360×230): I de 0.1 a 20 pu, t de 0.05 a 20 s ---
  const W = 360
  const H = 230
  const xOf = (I: number) => 42 + ((Math.log10(I) + 1) / (Math.log10(20) + 1)) * (W - 54)
  const yOf = (t: number) => 12 + (1 - (Math.log10(t) - Math.log10(0.05)) / (Math.log10(20) - Math.log10(0.05))) * (H - 42)
  const curve = (pickup: number, tms: number) => {
    const pts: string[] = []
    for (let k = 0; k <= 90; k++) {
      const I = pickup * 1.06 * Math.pow(20 / (pickup * 1.06), k / 90)
      const t = tIEC(I, pickup, tms)
      if (t && t <= 25 && t >= 0.04) pts.push(`${xOf(I)},${yOf(Math.min(20, t))}`)
    }
    return pts.join(' ')
  }

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · 51 y 51N: dos relés, dos mundos
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-zinc-800 px-4 py-2 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Falla:</span>
        {TIPOS.map((t) => (
          <button key={t.id} type="button" onClick={() => setKind(t.id)}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${kind === t.id ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {t.label}
          </button>
        ))}
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">R de falla</span>
          <input type="range" min={0} max={40} step={1} value={zf} onChange={(e) => setZf(Number(e.target.value))} className="w-24" />
          <span className="w-12 font-mono text-zinc-200">{(zf / 100).toFixed(2)}</span>
        </label>
      </div>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2 text-xs sm:grid-cols-2">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-32 font-semibold text-sky-300">51 fase: pickup</span>
          <input type="range" min={110} max={300} step={5} value={puF} onChange={(e) => setPuF(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{(puF / 100).toFixed(2)} pu</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-32 font-semibold text-sky-300">51 fase: TMS</span>
          <input type="range" min={5} max={60} step={5} value={tmsF} onChange={(e) => setTmsF(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{(tmsF / 100).toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-32 font-semibold text-violet-300">51N tierra: pickup</span>
          <input type="range" min={5} max={80} step={5} value={puN} onChange={(e) => setPuN(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{(puN / 100).toFixed(2)} pu</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-32 font-semibold text-violet-300">51N tierra: TMS</span>
          <input type="range" min={5} max={60} step={5} value={tmsN} onChange={(e) => setTmsN(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{(tmsN / 100).toFixed(2)}</span>
        </label>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="min-w-0 flex-1 px-2 py-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
            {/* Rejilla log */}
            {[0.1, 0.3, 1, 3, 10].map((I) => (
              <g key={I}>
                <line x1={xOf(I)} y1={12} x2={xOf(I)} y2={H - 30} stroke="#1f1f23" />
                <text x={xOf(I)} y={H - 18} fill="#71717a" fontSize={8} textAnchor="middle" fontFamily="monospace">{I}</text>
              </g>
            ))}
            {[0.1, 1, 10].map((t) => (
              <g key={t}>
                <line x1={42} y1={yOf(t)} x2={W - 12} y2={yOf(t)} stroke="#1f1f23" />
                <text x={36} y={yOf(t) + 3} fill="#71717a" fontSize={8} textAnchor="end" fontFamily="monospace">{t}</text>
              </g>
            ))}
            <text x={W / 2} y={H - 4} fill="#71717a" fontSize={8.5} textAnchor="middle">corriente [pu] (escala log)</text>
            <text x={12} y={H / 2} fill="#71717a" fontSize={8.5} textAnchor="middle" transform={`rotate(-90 12 ${H / 2})`}>t de disparo [s]</text>

            {/* Curvas */}
            <polyline points={curve(puF / 100, tmsF / 100)} fill="none" stroke="#38bdf8" strokeWidth={2} />
            <polyline points={curve(puN / 100, tmsN / 100)} fill="none" stroke="#a78bfa" strokeWidth={2} />
            <text x={W - 16} y={26} fill="#38bdf8" fontSize={9} textAnchor="end">51 (fase)</text>
            <text x={W - 16} y={38} fill="#a78bfa" fontSize={9} textAnchor="end">51N (tierra)</text>

            {/* Puntos de operación */}
            {tFase && iFase > 0.02 && (
              <g>
                <circle cx={xOf(Math.min(20, iFase))} cy={yOf(Math.min(20, tFase))} r={5} fill="#38bdf8" stroke="#0b0b0d" />
              </g>
            )}
            {!tFase && iFase > 0.02 && (
              <text x={xOf(Math.min(20, Math.max(0.1, iFase)))} y={22} fill="#38bdf8" fontSize={8.5} textAnchor="middle">I fase {iFase.toFixed(2)} pu: bajo pickup ✗</text>
            )}
            {tTierra && iRes > 0.02 && (
              <circle cx={xOf(Math.min(20, iRes))} cy={yOf(Math.min(20, tTierra))} r={5} fill="#a78bfa" stroke="#0b0b0d" />
            )}
          </svg>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">I de fase máx.</p>
            <p className="font-mono text-sm font-semibold text-sky-300">{iFase.toFixed(2)} pu</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Residual 3I₀</p>
            <p className="font-mono text-sm font-semibold text-violet-300">{iRes.toFixed(2)} pu</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">51 fase dispara en</p>
            <p className={`font-mono text-sm font-semibold ${tFase ? 'text-emerald-300' : 'text-red-300'}`}>
              {tFase ? `${tFase.toFixed(2)} s` : 'NO VE la falla'}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">51N tierra dispara en</p>
            <p className={`font-mono text-sm font-semibold ${tTierra ? 'text-emerald-300' : iRes < 0.02 ? 'text-zinc-500' : 'text-red-300'}`}>
              {tTierra ? `${tTierra.toFixed(2)} s` : iRes < 0.02 ? 'sin residual (ciego por diseño)' : 'NO VE la falla'}
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400">
            {!tFase && tTierra
              ? 'La falla es tan resistiva que el relé de FASE no la distingue de la carga — solo el 51N (pickup bajo, porque el residual de carga sana es ≈ 0) la caza. Esa es su razón de existir.'
              : tFase && !tTierra && iRes < 0.02
                ? 'Falla sin tierra: el 51N no ve nada — correcto, no es su trabajo. El de fase la despeja.'
                : tFase && tTierra
                  ? `Ambos la ven: dispara antes el ${tTierra! < tFase! ? '51N' : '51'} (${Math.min(tFase!, tTierra!).toFixed(2)} s). En coordinación real se deja ~0.3 s entre relés en cascada.`
                    : 'Ajusta pickups/TMS: ahora mismo la falla no se despeja — una protección que no dispara es solo un adorno caro.'}
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) SLG con R de falla 0.3 pu: la corriente de fase cae cerca de la carga y el 51 se queda
        ciego — baja el pickup del 51N a 0.1 pu y mira cómo la caza por el residual (la carga
        balanceada no produce 3I₀, así que el 51N puede ser MUY sensible sin disparos falsos);
        (2) falla L-L: residual cero, el 51N correctamente mudo — jamás confíes las fallas entre
        fases al relé de tierra; (3) sube el TMS del 51 y baja el del 51N: estás coordinando —
        el más cercano/sensible primero, el de respaldo después, con margen; (4) el flujo integral
        de un ajuste real: corriente de carga → pickup de fase sobre ella (aquí 1.1–3 pu) → curva
        sobre el arranque de motores → tierra APARTE con pickup bajo → verificar contra la falla
        mínima (la resistiva), no solo la franca.
      </footer>
    </div>
  )
}
