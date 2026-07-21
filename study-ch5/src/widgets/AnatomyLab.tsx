import { useEffect, useState } from 'react'
import { Box, FlaskConical, Pause, Play, RotateCcw } from 'lucide-react'
import MachineScene, { type Machine, type Part } from './anatomy3d/MachineScene'

// Puntos de color a juego con la paleta del render 3D
const PART_COLOR: Record<Part, string> = {
  estator: '#a1a1aa',
  rotor: '#c0392b',
  entrehierro: '#f5a524',
  campo: '#e17b2c',
  armadura: '#2f6fe0',
}
const PART_ORDER: Part[] = ['estator', 'rotor', 'entrehierro', 'campo', 'armadura']

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
  const [resetSignal, setResetSignal] = useState(0)
  const [running, setRunning] = useState(true)
  const [touring, setTouring] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [reveal, setReveal] = useState(1)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setRunning(false)
  }, [])

  useEffect(() => {
    if (!touring) return
    const timer = window.setInterval(() => {
      setPart((current) => PART_ORDER[(PART_ORDER.indexOf(current) + 1) % PART_ORDER.length])
    }, 3600)
    return () => window.clearInterval(timer)
  }, [touring])

  const selectPart = (next: Part) => {
    setTouring(false)
    setPart(next)
  }

  const toggleTour = () => {
    setTouring((value) => {
      const next = !value
      if (next) {
        setPart('estator')
        setReveal(1)
        setExploded(false)
        setRunning(true)
      }
      return next
    })
  }

  const info = INFO[machine][part]
  const partIdx = PART_ORDER.indexOf(part) + 1

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
            onClick={() => {
              setMachine(m)
              setTouring(false)
            }}
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

      <div className="grid gap-2 border-b border-zinc-800 bg-zinc-950/45 px-4 py-3 text-[11px] sm:grid-cols-[auto_auto_auto_1fr] sm:items-center">
        <button
          type="button"
          onClick={toggleTour}
          aria-pressed={touring}
          className={`flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 font-semibold transition-colors ${
            touring
              ? 'border-cyan-400/70 bg-cyan-400/15 text-cyan-200'
              : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-cyan-500/60'
          }`}
        >
          {touring ? <Pause size={12} /> : <Play size={12} />}
          {touring ? 'Pausar recorrido' : 'Recorrido guiado'}
        </button>
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          aria-pressed={running}
          className="flex items-center justify-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 font-semibold text-zinc-300 hover:border-zinc-500"
        >
          {running ? <Pause size={12} /> : <Play size={12} />}
          {running ? 'Pausar giro' : 'Animar giro'}
        </button>
        <button
          type="button"
          onClick={() => {
            setExploded((value) => !value)
            setTouring(false)
          }}
          aria-pressed={exploded}
          className={`flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 font-semibold transition-colors ${
            exploded
              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
              : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-500/60'
          }`}
        >
          <Box size={12} /> {exploded ? 'Ensamblar' : 'Vista explotada'}
        </button>
        <label className="flex min-w-0 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5 text-zinc-400">
          <span className="shrink-0 font-semibold text-zinc-300">Corte</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(reveal * 100)}
            onChange={(event) => {
              setReveal(Number(event.target.value) / 100)
              setTouring(false)
            }}
            aria-label="Porcentaje de corte para revelar el interior"
            className="min-w-16 flex-1 accent-cyan-400"
          />
          <span className="w-8 text-right tabular-nums text-cyan-300">{Math.round(reveal * 100)}%</span>
        </label>
        <div className="flex items-center gap-1 sm:col-start-4 sm:justify-end">
          <span className="mr-1 text-zinc-500">Velocidad</span>
          {[0.5, 1, 1.75].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              aria-pressed={speed === value}
              className={`rounded px-1.5 py-0.5 font-semibold ${
                speed === value ? 'bg-cyan-500/20 text-cyan-200' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {value}×
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative h-72 w-full max-w-sm shrink-0 touch-none sm:h-80">
          <MachineScene
            machine={machine}
            part={part}
            onSelect={selectPart}
            resetSignal={resetSignal}
            running={running}
            speed={speed}
            reveal={reveal}
            exploded={exploded}
          />
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-zinc-300">
            Arrastra para rotar · el corte revela el interior
          </span>
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-semibold text-amber-300 ring-1 ring-amber-500/40">
            Explorando {partIdx} de 5
          </span>
          <button
            type="button"
            onClick={() => setResetSignal((v) => v + 1)}
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-zinc-200 ring-1 ring-zinc-600 hover:bg-black/75"
          >
            <RotateCcw size={11} /> Restablecer vista
          </button>
        </div>

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
              <button key={p} type="button" onClick={() => selectPart(p)}
                className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                  part === p
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                }`}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PART_COLOR[p] }} />
                {label}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PART_COLOR[part] }} />
              {info.title}
            </p>
            <p className="text-xs leading-relaxed text-zinc-300">{info.text}</p>
            {touring && (
              <div className="mt-3 flex items-center gap-1" aria-label={`Paso ${partIdx} de 5 del recorrido guiado`}>
                {PART_ORDER.map((tourPart, index) => (
                  <span
                    key={tourPart}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      index < partIdx ? 'bg-cyan-400' : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            )}
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
