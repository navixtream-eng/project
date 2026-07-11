import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { cx } from '../lib/machine'
import { solveFault } from '../lib/secuencias'

type Tierra = 'solido' | 'zn' | 'aislado'

/**
 * Laboratorio — Las tres redes de secuencia del generador y su aterrizamiento.
 * Cada secuencia «ve» una máquina distinta: la positiva tiene fuente, la
 * negativa solo impedancia, y la cero pasa por el neutro (3Zn). El selector
 * de aterrizamiento reconfigura la red cero y con ella la falla a tierra.
 */
export default function SequenceNetworkLab() {
  const [x1, setX1] = useState(20) // %/100
  const [x0, setX0] = useState(8)
  const [tierra, setTierra] = useState<Tierra>('solido')
  const [zn, setZn] = useState(10) // % (solo en modo 'zn')

  const X1 = x1 / 100
  const X2 = X1
  const X0 = x0 / 100
  const Zn = tierra === 'zn' ? cx(zn / 100, 0) : cx(0, 0)

  const slg =
    tierra === 'aislado'
      ? null
      : solveFault({ kind: 'slg', E: 1, Z1: cx(0, X1), Z2: cx(0, X2), Z0: cx(0, X0), Zf: cx(0, 0), Zn })
  const if3f = 1 / X1

  // --- Dibujo de las tres redes (SVG 640×250) ---
  const NET_Y = [40, 118, 196]
  const net = (i: number, label: string, hasSource: boolean, zLabel: string) => {
    const y = NET_Y[i]
    return (
      <g key={label}>
        <text x={8} y={y + 4} fill="#a1a1aa" fontSize={11} fontWeight={700}>{label}</text>
        {/* Fuente (solo positiva) */}
        {hasSource ? (
          <>
            <circle cx={120} cy={y} r={13} fill="none" stroke="#10b981" strokeWidth={1.8} />
            <text x={120} y={y + 4} fill="#10b981" fontSize={10} textAnchor="middle">E</text>
          </>
        ) : (
          <line x1={107} y1={y} x2={133} y2={y} stroke="#3f3f46" strokeWidth={1.8} />
        )}
        <line x1={133} y1={y} x2={205} y2={y} stroke="#3f3f46" strokeWidth={1.8} />
        {/* Impedancia */}
        <rect x={205} y={y - 10} width={70} height={20} fill="#18181b" stroke="#64748b" rx={3} />
        <text x={240} y={y + 4} fill="#cbd5e1" fontSize={10} textAnchor="middle" fontFamily="monospace">{zLabel}</text>
        <line x1={275} y1={y} x2={360} y2={y} stroke="#3f3f46" strokeWidth={1.8} />
        {/* Terminal de falla */}
        <circle cx={360} cy={y} r={4} fill="#e4b34c" />
        <text x={372} y={y + 4} fill="#e4b34c" fontSize={9} fontFamily="monospace">{['F₁', 'F₂', 'F₀'][i]}</text>
        {/* Barra de referencia */}
        <line x1={95} y1={y + 26} x2={370} y2={y + 26} stroke="#334155" strokeWidth={2.5} />
        {hasSource && <line x1={120} y1={y + 13} x2={120} y2={y + 26} stroke="#3f3f46" strokeWidth={1.8} />}
      </g>
    )
  }

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Las tres redes del generador y el neutro
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">X₁ = X₂</span>
          <input type="range" min={10} max={40} step={1} value={x1} onChange={(e) => setX1(Number(e.target.value))} className="w-24" />
          <span className="w-14 font-mono text-zinc-200">{(x1 / 100).toFixed(2)} pu</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-violet-300">X₀</span>
          <input type="range" min={3} max={15} step={1} value={x0} onChange={(e) => setX0(Number(e.target.value))} className="w-24" />
          <span className="w-14 font-mono text-zinc-200">{(x0 / 100).toFixed(2)} pu</span>
        </label>
        <span className="text-zinc-600">|</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Neutro:</span>
        {(
          [
            ['solido', 'sólido a tierra'],
            ['zn', 'con reactor Zn'],
            ['aislado', 'aislado'],
          ] as [Tierra, string][]
        ).map(([m, lbl]) => (
          <button key={m} type="button" onClick={() => setTierra(m)}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${tierra === m ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {lbl}
          </button>
        ))}
        {tierra === 'zn' && (
          <label className="flex items-center gap-2 text-zinc-400">
            <input type="range" min={2} max={40} step={1} value={zn} onChange={(e) => setZn(Number(e.target.value))} className="w-24" />
            <span className="w-16 font-mono text-zinc-200">Zn {(zn / 100).toFixed(2)} pu</span>
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="min-w-0 flex-1 px-2 py-2">
          <svg viewBox="0 0 400 250" className="h-auto w-full">
            {net(0, 'POSITIVA', true, `jX₁ = j${(x1 / 100).toFixed(2)}`)}
            {net(1, 'NEGATIVA', false, `jX₂ = j${(x1 / 100).toFixed(2)}`)}
            {net(2, 'CERO', false, `jX₀ = j${(x0 / 100).toFixed(2)}`)}
            {/* Rama de neutro en la red cero */}
            {tierra === 'solido' && (
              <text x={110} y={NET_Y[2] + 20} fill="#10b981" fontSize={9} fontFamily="monospace">3Zn = 0 (sólido)</text>
            )}
            {tierra === 'zn' && (
              <>
                <rect x={100} y={NET_Y[2] + 6} width={44} height={14} fill="#18181b" stroke="#a78bfa" rx={3} />
                <text x={122} y={NET_Y[2] + 16} fill="#a78bfa" fontSize={8.5} textAnchor="middle" fontFamily="monospace">3Zn={(3 * zn / 100).toFixed(2)}</text>
              </>
            )}
            {tierra === 'aislado' && (
              <>
                <line x1={110} y1={NET_Y[2] + 8} x2={126} y2={NET_Y[2] + 20} stroke="#f87171" strokeWidth={2} />
                <text x={132} y={NET_Y[2] + 18} fill="#f87171" fontSize={9} fontFamily="monospace">abierto: I₀ no puede volver</text>
              </>
            )}
          </svg>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Falla 3φ (referencia)</p>
            <p className="font-mono text-sm font-semibold text-zinc-100">{if3f.toFixed(2)} pu</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Falla SLG en bornes</p>
            <p className={`font-mono text-sm font-semibold ${slg && slg.iFalla > if3f ? 'text-red-300' : 'text-emerald-300'}`}>
              {slg ? `${slg.iFalla.toFixed(2)} pu` : '≈ 0 (capacitiva)'}
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">SLG / 3φ</p>
            <div className="mt-1 h-3 w-full overflow-hidden rounded-sm bg-zinc-900">
              <div
                className={`h-full ${slg && slg.iFalla > if3f ? 'bg-red-500/70' : 'bg-emerald-500/70'}`}
                style={{ width: `${slg ? Math.min(100, (slg.iFalla / if3f) * 62) : 1}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-xs text-zinc-300">
              {slg ? `${((slg.iFalla / if3f) * 100).toFixed(0)} % de la trifásica` : 'sin camino de retorno: solo corriente capacitiva residual'}
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400">
            {tierra === 'solido' &&
              'Sólido: máxima corriente de falla a tierra (relés felices, máquina castigada) pero sin sobretensiones en las fases sanas.'}
            {tierra === 'zn' &&
              'Con reactor: el 3Zn en serie doma la corriente de tierra al valor que TÚ eliges — el compromiso estándar en generadores.'}
            {tierra === 'aislado' &&
              'Aislado: casi no hay corriente de falla… pero las fases sanas se van a tensión de LÍNEA (√3) y la primera falla queda oculta esperando a la segunda.'}
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con neutro sólido y X₀ &lt; X₁ (lo normal en generadores): la SLG SUPERA a la trifásica —
        el camino de secuencia cero es «corto»; (2) activa el reactor y súbelo hasta que la SLG
        caiga por debajo de la 3φ: acabas de DISEÑAR un aterrizamiento (así se especifica el
        reactor de neutro real); (3) mira la red cero al cambiar el selector: la falla a tierra es
        LA aplicación de esa red — sin camino por el neutro (aislado), I₀ no existe y la falla casi
        no produce corriente; (4) nota que la NEGATIVA es la positiva sin fuente: el generador no
        «fabrica» secuencia negativa, solo la sufre.
      </footer>
    </div>
  )
}
