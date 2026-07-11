import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { type Conexion, zeroSeqTopology } from '../lib/secuencias'

const OPCIONES: { id: Conexion; label: string }[] = [
  { id: 'Yg', label: 'Y aterrizada (Yg)' },
  { id: 'Y', label: 'Y aislada' },
  { id: 'D', label: 'Delta (Δ)' },
]

/**
 * Laboratorio — El transformador dentro de la red de secuencia CERO.
 * La conexión de cada devanado decide si la I₀ atraviesa, se queda circulando
 * en la delta, o no entra: el circuito equivalente se reconfigura en vivo.
 */
export default function ZeroSeqTrafoLab() {
  const [l1, setL1] = useState<Conexion>('Yg')
  const [l2, setL2] = useState<Conexion>('D')
  const topo = zeroSeqTopology(l1, l2)

  const Y = 78
  const conecta1 = l1 === 'Yg'
  const conecta2 = l2 === 'Yg'

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · La red cero del transformador (Yg / Y / Δ)
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        {([['Lado 1 (primario)', l1, setL1], ['Lado 2 (secundario)', l2, setL2]] as const).map(
          ([titulo, val, setter]) => (
            <div key={titulo} className="flex flex-wrap items-center gap-1.5">
              <span className="w-36 font-semibold text-zinc-300">{titulo}</span>
              {OPCIONES.map((op) => (
                <button key={op.id} type="button" onClick={() => setter(op.id)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold ${val === op.id ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  {op.label}
                </button>
              ))}
            </div>
          ),
        )}
      </div>

      <div className="px-2 py-2">
        <svg viewBox="0 0 640 170" className="h-auto w-full">
          {/* Terminales de línea */}
          <text x={30} y={Y - 14} fill="#a1a1aa" fontSize={11}>línea 1</text>
          <circle cx={40} cy={Y} r={4} fill="#e4b34c" />
          <text x={575} y={Y - 14} fill="#a1a1aa" fontSize={11}>línea 2</text>
          <circle cx={600} cy={Y} r={4} fill="#e4b34c" />

          {/* Tramo lado 1 → ZT */}
          {conecta1 ? (
            <line x1={40} y1={Y} x2={280} y2={Y} stroke="#38bdf8" strokeWidth={2.5} />
          ) : (
            <>
              <line x1={40} y1={Y} x2={130} y2={Y} stroke="#3f3f46" strokeWidth={2} />
              <line x1={130} y1={Y - 4} x2={152} y2={Y - 18} stroke="#f87171" strokeWidth={2.5} />
              <line x1={152} y1={Y} x2={280} y2={Y} stroke="#3f3f46" strokeWidth={2} />
              <text x={118} y={Y - 24} fill="#f87171" fontSize={9}>abierto ({l1 === 'Y' ? 'Y aislada' : 'Δ'})</text>
            </>
          )}

          {/* Impedancia del transformador */}
          <rect x={280} y={Y - 12} width={80} height={24} fill="#18181b" stroke="#64748b" rx={4} />
          <text x={320} y={Y + 4} fill="#cbd5e1" fontSize={11} textAnchor="middle" fontFamily="monospace">jX_T0</text>

          {/* Tramo ZT → lado 2 */}
          {conecta2 ? (
            <line x1={360} y1={Y} x2={600} y2={Y} stroke="#38bdf8" strokeWidth={2.5} />
          ) : (
            <>
              <line x1={360} y1={Y} x2={478} y2={Y} stroke="#3f3f46" strokeWidth={2} />
              <line x1={478} y1={Y - 4} x2={500} y2={Y - 18} stroke="#f87171" strokeWidth={2.5} />
              <line x1={500} y1={Y} x2={600} y2={Y} stroke="#3f3f46" strokeWidth={2} />
              <text x={468} y={Y - 24} fill="#f87171" fontSize={9}>abierto ({l2 === 'Y' ? 'Y aislada' : 'Δ'})</text>
            </>
          )}

          {/* Derivaciones a referencia por la Δ (si el otro lado es Yg) */}
          {topo.shunt1 && (
            <>
              <line x1={360} y1={Y} x2={400} y2={Y} stroke="#a78bfa" strokeWidth={2.5} />
              <line x1={400} y1={Y} x2={400} y2={140} stroke="#a78bfa" strokeWidth={2.5} />
              <text x={408} y={112} fill="#a78bfa" fontSize={9}>la Δ del lado 2 da retorno</text>
            </>
          )}
          {topo.shunt2 && (
            <>
              <line x1={280} y1={Y} x2={240} y2={Y} stroke="#a78bfa" strokeWidth={2.5} />
              <line x1={240} y1={Y} x2={240} y2={140} stroke="#a78bfa" strokeWidth={2.5} />
              <text x={126} y={112} fill="#a78bfa" fontSize={9}>la Δ del lado 1 da retorno</text>
            </>
          )}

          {/* Barra de referencia */}
          <line x1={40} y1={140} x2={600} y2={140} stroke="#334155" strokeWidth={3} />
          <text x={44} y={156} fill="#64748b" fontSize={9}>barra de referencia (tierra)</text>

          {/* Estado global */}
          <text x={320} y={22} fill={topo.through ? '#10b981' : topo.shunt1 || topo.shunt2 ? '#a78bfa' : '#f87171'} fontSize={11} textAnchor="middle" fontWeight={700}>
            {topo.through
              ? 'I₀ ATRAVIESA: las dos redes quedan conectadas por jX_T0'
              : topo.shunt1 || topo.shunt2
                ? 'I₀ entra por el lado Yg y RETORNA por la delta: derivación a referencia, línea contraria aislada'
                : 'red cero ABIERTA: ninguna I₀ circula por el transformador'}
          </text>
        </svg>
      </div>

      <div className="mx-3 mb-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-[11px] leading-relaxed text-zinc-300">
        {topo.regla}
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) Yg–Δ (el clásico de subestación): una falla a tierra del lado Yg SÍ encuentra retorno
        (por la delta) pero NO se propaga como I₀ al otro sistema — la delta es una «trampa» de
        secuencia cero, por eso este banco aísla las fallas a tierra entre niveles; (2) Yg–Yg: la
        única combinación donde la falla a tierra de un lado se alimenta desde el otro; (3) pon Y
        aislada en cualquier lado: la red se abre — un sistema sin neutro no aporta ni un ampere de
        secuencia cero; (4) regla mnemotécnica: Yg = puerta abierta a la línea; Δ = escalera a
        tierra por dentro; Y = pared.
      </footer>
    </div>
  )
}
