import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { abs } from '../lib/machine'
import { type Fuente, type Rama, buildZbus, zbusFault } from '../lib/secuencias'

// Sistema de 4 buses: G1—(L12)—carga—(L23)—G2, con motor colgado del bus 2.
//   bus 0: G1 (X=0.20)   bus 1: barra de carga   bus 2: G2 (X=0.25)   bus 3: M (X″=0.30)
const XG1 = 0.2
const XG2 = 0.25
const XM = 0.3
const L12 = 0.1
const L23 = 0.15
const L24 = 0.1
const NOMBRES = ['G1', 'Carga', 'G2', 'Motor']

/**
 * Laboratorio — Zbus: la falla en CUALQUIER punto de un sistema multimáquina.
 * La matriz Zbus (inversa de Ybus) contiene el Thévenin de todos los buses a
 * la vez: Z_kk es la impedancia de falla del bus k, y las tensiones durante
 * la falla salen de la columna k. Incluye falla deslizante a lo largo de una
 * línea (bus ficticio) y el aporte del motor de inducción.
 */
export default function ZbusFaultLab() {
  const [modo, setModo] = useState<'bus' | 'linea'>('bus')
  const [busFalla, setBusFalla] = useState(1)
  const [tPct, setTPct] = useState(40) // posición de la falla en la línea 2–3 (buses 1–2)
  const [conMotor, setConMotor] = useState(true)

  const { If, V, aportes, zkk, kFalla } = useMemo(() => {
    const fuentes: Fuente[] = [
      { bus: 0, x: XG1 },
      { bus: 2, x: XG2 },
      ...(conMotor ? [{ bus: 3, x: XM }] : []),
    ]
    let ramas: Rama[]
    let n: number
    let k: number
    if (modo === 'bus') {
      ramas = [
        { de: 0, a: 1, x: L12 },
        { de: 1, a: 2, x: L23 },
        { de: 1, a: 3, x: L24 },
      ]
      n = 4
      k = busFalla
    } else {
      // Bus ficticio 4 en la línea carga(1)–G2(2), a fracción t
      const t = Math.min(0.95, Math.max(0.05, tPct / 100))
      ramas = [
        { de: 0, a: 1, x: L12 },
        { de: 1, a: 4, x: L23 * t },
        { de: 4, a: 2, x: L23 * (1 - t) },
        { de: 1, a: 3, x: L24 },
      ]
      n = 5
      k = 4
    }
    const Z = buildZbus(n, ramas, fuentes)
    const r = zbusFault(Z, k, fuentes)
    return { If: abs(r.If), V: r.V.map(abs), aportes: r.aportes, zkk: abs(Z[k][k]), kFalla: k }
  }, [modo, busFalla, tPct, conMotor])

  const fuentesNombres = ['G1', 'G2', ...(conMotor ? ['Motor'] : [])]

  // --- Unifilar (SVG 640×190) ---
  const BX = [70, 260, 450, 260] // posiciones x de los buses 0..3
  const BY = [70, 70, 70, 150]
  const lineaFx = BX[1] + (BX[2] - BX[1]) * (tPct / 100)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Zbus: el Thévenin de todos los buses a la vez
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setModo('bus')}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${modo === 'bus' ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
          Falla en un bus
        </button>
        <button type="button" onClick={() => setModo('linea')}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${modo === 'linea' ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
          Falla a lo largo de la línea Carga–G2
        </button>
        {modo === 'bus' ? (
          <span className="flex items-center gap-1.5">
            {NOMBRES.map((nm, i) => (
              <button key={nm} type="button" onClick={() => setBusFalla(i)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold ${busFalla === i ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {nm}
              </button>
            ))}
          </span>
        ) : (
          <label className="flex flex-1 items-center gap-2 text-zinc-400">
            <span className="font-semibold text-red-300">posición</span>
            <input type="range" min={5} max={95} step={5} value={tPct}
              onChange={(e) => setTPct(Number(e.target.value))} className="max-w-48 flex-1" />
            <span className="w-24 font-mono text-zinc-200">{tPct} % desde Carga</span>
          </label>
        )}
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-zinc-400">
          <input type="checkbox" checked={conMotor} onChange={(e) => setConMotor(e.target.checked)}
            className="h-3.5 w-3.5 accent-amber-500" />
          aporte del motor (X″ = {XM} pu)
        </label>
      </div>

      <div className="px-2 py-2">
        <svg viewBox="0 0 640 190" className="h-auto w-full">
          {/* Líneas */}
          <line x1={BX[0]} y1={BY[0]} x2={BX[1]} y2={BY[1]} stroke="#3f3f46" strokeWidth={2.5} />
          <line x1={BX[1]} y1={BY[1]} x2={BX[2]} y2={BY[2]} stroke="#3f3f46" strokeWidth={2.5} />
          <line x1={BX[1]} y1={BY[1]} x2={BX[3]} y2={BY[3]} stroke="#3f3f46" strokeWidth={2.5} />
          <text x={(BX[0] + BX[1]) / 2} y={BY[0] - 8} fill="#71717a" fontSize={8.5} textAnchor="middle" fontFamily="monospace">j{L12}</text>
          <text x={(BX[1] + BX[2]) / 2} y={BY[0] - 8} fill="#71717a" fontSize={8.5} textAnchor="middle" fontFamily="monospace">j{L23}</text>
          <text x={BX[1] - 26} y={(BY[1] + BY[3]) / 2} fill="#71717a" fontSize={8.5} fontFamily="monospace">j{L24}</text>

          {/* Buses con su tensión de falla */}
          {NOMBRES.map((nm, i) => {
            const vi = V[i] ?? 0
            const esFalla = modo === 'bus' && kFalla === i
            return (
              <g key={nm}>
                <line x1={BX[i] - 22} y1={BY[i]} x2={BX[i] + 22} y2={BY[i]} stroke={esFalla ? '#f87171' : '#a1a1aa'} strokeWidth={5} />
                <text x={BX[i]} y={BY[i] - 12} fill="#e4e4e7" fontSize={10} textAnchor="middle" fontWeight={700}>{nm}</text>
                <text x={BX[i]} y={BY[i] + 18} fill={vi < 0.5 ? '#f87171' : vi < 0.8 ? '#e4b34c' : '#10b981'} fontSize={9} textAnchor="middle" fontFamily="monospace">
                  {vi.toFixed(2)} pu
                </text>
                {esFalla && <text x={BX[i]} y={BY[i] + 34} fill="#f87171" fontSize={12} textAnchor="middle">⚡</text>}
              </g>
            )
          })}
          {/* Fuentes */}
          {[{ i: 0, lbl: `jXg=${XG1}` }, { i: 2, lbl: `jXg=${XG2}` }].map(({ i, lbl }) => (
            <g key={i}>
              <circle cx={BX[i]} cy={BY[i] - 38} r={11} fill="none" stroke="#10b981" strokeWidth={1.6} />
              <text x={BX[i]} y={BY[i] - 34} fill="#10b981" fontSize={9} textAnchor="middle">G</text>
              <line x1={BX[i]} y1={BY[i] - 27} x2={BX[i]} y2={BY[i] - 3} stroke="#3f3f46" strokeWidth={1.8} />
              <text x={BX[i] + 16} y={BY[i] - 30} fill="#52525b" fontSize={7.5} fontFamily="monospace">{lbl}</text>
            </g>
          ))}
          {conMotor && (
            <g>
              <circle cx={BX[3]} cy={BY[3] + 32} r={11} fill="none" stroke="#e4b34c" strokeWidth={1.6} />
              <text x={BX[3]} y={BY[3] + 36} fill="#e4b34c" fontSize={9} textAnchor="middle">M</text>
              <line x1={BX[3]} y1={BY[3] + 21} x2={BX[3]} y2={BY[3] + 3} stroke="#3f3f46" strokeWidth={1.8} />
            </g>
          )}
          {/* Falla deslizante en la línea */}
          {modo === 'linea' && (
            <g>
              <circle cx={lineaFx} cy={BY[1]} r={5} fill="#f87171" />
              <text x={lineaFx} y={BY[1] + 22} fill="#f87171" fontSize={12} textAnchor="middle">⚡</text>
              <text x={lineaFx} y={BY[1] - 14} fill="#f87171" fontSize={8.5} textAnchor="middle" fontFamily="monospace">
                V = {(V[4] ?? 0).toFixed(2)}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Z_kk (Thévenin)</p>
          <p className="font-mono text-sm font-semibold text-sky-300">{zkk.toFixed(3)} pu</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">I falla = E/Z_kk</p>
          <p className="font-mono text-sm font-semibold text-red-300">{If.toFixed(2)} pu</p>
        </div>
        <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Aportes a la falla</p>
          <p className="font-mono text-xs text-zinc-200">
            {fuentesNombres.map((nm, i) => `${nm}: ${aportes[i].toFixed(2)}`).join(' · ')} pu
          </p>
          <div className="mt-1 flex h-2.5 w-full overflow-hidden rounded-sm bg-zinc-900">
            {aportes.map((a, i) => (
              <div key={fuentesNombres[i]}
                className={['bg-emerald-500/70', 'bg-sky-500/70', 'bg-amber-500/70'][i]}
                style={{ width: `${(a / (If || 1)) * 100}%` }} />
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) falla en cada bus: Z_kk cambia — la MISMA matriz contiene el Thévenin de todos los
        puntos (eso es Zbus: calcular una vez, fallar donde quieras); (2) mira el perfil de
        tensiones: la falla deprime TODO el vecindario y el bus más cercano cae más — así se
        estiman los huecos de tensión (sags) que sienten las cargas lejanas; (3) desliza la falla
        por la línea: el mínimo de corriente NO está en el centro sino donde el Thévenin combinado
        es máximo — el bus ficticio es exactamente como los programas profesionales fallan «al 37 %
        de la línea»; (4) apaga el aporte del motor y falla en Carga: la corriente baja ~1 pu — el
        motor de inducción devuelve corriente de falla durante los primeros ciclos (X″ tras su FEM
        atrapada) y el interruptor debe interrumpir TAMBIÉN esa; (5) todo esto es la red POSITIVA:
        para fallas desbalanceadas se construye una Zbus por secuencia y se conectan en el bus
        fallado igual que en la sección 4 — mismo método, tres matrices.
      </footer>
    </div>
  )
}
