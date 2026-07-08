import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

type Part = 'estator' | 'rotor' | 'entrehierro' | 'campo' | 'armadura'
type Machine = 'sincrona' | 'induccion'

/** Colores coherentes con el resto del documento (paleta validada) */
const HL = '#c98500' // resaltado de la parte seleccionada
const COLORS = { steel: '#27272a', edge: '#52525b', copper: '#3987e5', field: '#e66767', gap: '#199e70' }

const INFO: Record<Machine, Record<Part, { title: string; text: string }>> = {
  sincrona: {
    estator: {
      title: 'Estator (la parte fija)',
      text: 'Corona de acero laminado con ranuras internas. Aloja el devanado de ARMADURA trifásico (a-b-c). Se lamina para cortar las corrientes de Foucault: el flujo que lo atraviesa alterna a 60 Hz.',
    },
    rotor: {
      title: 'Rotor de polos salientes (la parte móvil)',
      text: 'Gira a velocidad síncrona exacta. Sus polos llevan el devanado de CAMPO alimentado con corriente continua a través de anillos rozantes (o excitatriz sin escobillas). El hierro del rotor puede ser macizo: su flujo es constante en el marco del rotor.',
    },
    entrehierro: {
      title: 'Entrehierro (el escenario)',
      text: 'El espacio de aire — a menudo de solo unos milímetros — donde los campos del estator y del rotor se encuentran y negocian el par. Casi toda la FMM del circuito magnético se consume aquí (el aire es ~5000 veces más «duro» que el acero).',
    },
    campo: {
      title: 'Devanado de campo (fabrica el flujo)',
      text: 'Bobinas de CD sobre los polos del rotor: un electroimán giratorio cuya intensidad controlas con If — la perilla de Eaf y de los reactivos que aprendiste en el Cap. 5.',
    },
    armadura: {
      title: 'Devanado de armadura / inducido (cosecha la potencia)',
      text: 'Tres fases distribuidas en las ranuras del estator, desplazadas 120°. Aquí se induce la FEM y por aquí fluye la potencia hacia la red. Va en el estator porque manejar megawatts con contactos deslizantes sería un mal negocio.',
    },
  },
  induccion: {
    estator: {
      title: 'Estator (idéntico al de la síncrona)',
      text: 'La misma corona ranurada con el mismo devanado trifásico produciendo el mismo campo giratorio. Las dos grandes máquinas de CA comparten estator — se distinguen por el rotor.',
    },
    rotor: {
      title: 'Rotor jaula de ardilla',
      text: 'Barras de aluminio o cobre en corto por anillos extremos: un devanado sin fuente propia. Gira LIGERAMENTE más lento que el campo (deslizamiento): esa diferencia induce las corrientes que producen el par. Sin deslizamiento no hay inducción — por eso nunca alcanza la velocidad síncrona.',
    },
    entrehierro: {
      title: 'Entrehierro (aún más pequeño)',
      text: 'En inducción se hace lo más estrecho posible: toda la magnetización debe venir del estator (no hay campo de CD que ayude), y cada décima de milímetro extra cuesta corriente magnetizante y factor de potencia.',
    },
    campo: {
      title: '¿Devanado de campo? No existe',
      text: 'La jaula hace de «campo» inducido: el campo giratorio del estator induce corrientes en las barras y estas crean el campo del rotor. La máquina se excita sola a costa de operar siempre con fp en atraso.',
    },
    armadura: {
      title: 'Devanado de armadura (estator)',
      text: 'El mismo trifásico distribuido. En el motor de inducción hace DOBLE trabajo: entrega la potencia Y magnetiza la máquina — por eso el motor de inducción siempre absorbe reactivos.',
    },
  },
}

export default function AnatomyLab() {
  const [machine, setMachine] = useState<Machine>('sincrona')
  const [part, setPart] = useState<Part>('entrehierro')

  const sel = (p: Part) => (part === p ? HL : undefined)
  const info = INFO[machine][part]

  const cx = 170
  const cy = 150
  const slotN = 24

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Anatomía de la máquina rotativa (toca cada parte)
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        {(
          [
            ['sincrona', 'Máquina síncrona elemental'],
            ['induccion', 'Máquina de inducción'],
          ] as [Machine, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMachine(m)}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
              machine === m
                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <svg viewBox="0 0 340 300" className="w-full max-w-sm shrink-0 select-none">
          {/* Estator */}
          <g className="cursor-pointer" onClick={() => setPart('estator')}>
            <circle cx={cx} cy={cy} r={128} fill={COLORS.steel} stroke={sel('estator') ?? COLORS.edge} strokeWidth={sel('estator') ? 3 : 1.5} />
            <circle cx={cx} cy={cy} r={86} fill="#09090b" stroke="none" />
          </g>
          {/* Ranuras + armadura */}
          <g className="cursor-pointer" onClick={() => setPart('armadura')}>
            {Array.from({ length: slotN }, (_, i) => {
              const a = (i / slotN) * 2 * Math.PI
              const r = 96
              return (
                <circle key={i} cx={cx + r * Math.cos(a)} cy={cy - r * Math.sin(a)}
                  r={5} fill={sel('armadura') ?? COLORS.copper} opacity={0.9} />
              )
            })}
          </g>
          {/* Entrehierro (anillo) */}
          <g className="cursor-pointer" onClick={() => setPart('entrehierro')}>
            <circle cx={cx} cy={cy} r={82} fill="none"
              stroke={sel('entrehierro') ?? COLORS.gap} strokeWidth={sel('entrehierro') ? 6 : 3}
              strokeDasharray="4 4" opacity={0.9} />
          </g>
          {/* Rotor */}
          {machine === 'sincrona' ? (
            <g className="cursor-pointer" onClick={() => setPart('rotor')}>
              {/* núcleo + dos polos salientes */}
              <circle cx={cx} cy={cy} r={34} fill={COLORS.steel} stroke={sel('rotor') ?? COLORS.edge} strokeWidth={sel('rotor') ? 3 : 1.5} />
              {[0, Math.PI].map((a) => (
                <g key={a} transform={`rotate(${(-a * 180) / Math.PI + 25} ${cx} ${cy})`}>
                  <rect x={cx + 26} y={cy - 16} width={36} height={32} rx={5}
                    fill={COLORS.steel} stroke={sel('rotor') ?? COLORS.edge} strokeWidth={sel('rotor') ? 3 : 1.5} />
                  <path d={`M ${cx + 60} ${cy - 26} A 78 78 0 0 1 ${cx + 60} ${cy + 26} L ${cx + 56} ${cy + 18} A 66 66 0 0 0 ${cx + 56} ${cy - 18} Z`}
                    fill={COLORS.steel} stroke={sel('rotor') ?? COLORS.edge} strokeWidth={1.5} />
                </g>
              ))}
              {/* bobinas de campo */}
              <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setPart('campo') }}>
                {[25, 205].map((deg) => (
                  <g key={deg} transform={`rotate(${-deg} ${cx} ${cy})`}>
                    <rect x={cx + 28} y={cy - 22} width={30} height={7} rx={3} fill={sel('campo') ?? COLORS.field} />
                    <rect x={cx + 28} y={cy + 15} width={30} height={7} rx={3} fill={sel('campo') ?? COLORS.field} />
                  </g>
                ))}
              </g>
              <text x={cx} y={cy + 4} textAnchor="middle" fill="#71717a" fontSize={10}>N — S</text>
            </g>
          ) : (
            <g className="cursor-pointer" onClick={() => setPart('rotor')}>
              <circle cx={cx} cy={cy} r={76} fill={COLORS.steel} stroke={sel('rotor') ?? COLORS.edge} strokeWidth={sel('rotor') ? 3 : 1.5} />
              {/* barras de jaula */}
              {Array.from({ length: 18 }, (_, i) => {
                const a = (i / 18) * 2 * Math.PI
                const r = 66
                return (
                  <circle key={i} cx={cx + r * Math.cos(a)} cy={cy - r * Math.sin(a)}
                    r={4.5} fill={sel('campo') ?? '#9085e9'}
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setPart('campo') }} />
                )
              })}
              <text x={cx} y={cy + 4} textAnchor="middle" fill="#71717a" fontSize={9}>jaula en corto</text>
            </g>
          )}
          {/* Etiquetas directas */}
          <text x={cx} y={16} textAnchor="middle" fill="#a1a1aa" fontSize={10}>estator (fijo)</text>
          <text x={cx} y={294} textAnchor="middle" fill="#a1a1aa" fontSize={10}>corte transversal — el eje sale de la página</text>
        </svg>

        <div className="flex-1 p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {(
              [
                ['estator', 'Estator'],
                ['rotor', 'Rotor'],
                ['entrehierro', 'Entrehierro'],
                ['campo', machine === 'sincrona' ? 'Devanado de campo' : '«Campo» (jaula)'],
                ['armadura', 'Armadura (inducido)'],
              ] as [Part, string][]
            ).map(([p, label]) => (
              <button key={p} type="button" onClick={() => setPart(p)}
                className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                  part === p
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                }`}>
                {label}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <p className="mb-1 text-xs font-bold text-amber-300">{info.title}</p>
            <p className="text-xs leading-relaxed text-zinc-300">{info.text}</p>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) recorre las cinco partes en la máquina síncrona y luego cambia a inducción: el ESTATOR no
        cambia — toda la diferencia entre las dos grandes familias de CA vive en el rotor; (2) nota
        dónde está cada devanado y por qué: el de potencia (armadura) quieto y con terminales fijas,
        el de campo (poca potencia) girando con anillos rozantes — o sustituido por una jaula que se
        excita sola.
      </footer>
    </div>
  )
}
