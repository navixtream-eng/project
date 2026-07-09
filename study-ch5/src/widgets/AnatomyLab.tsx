import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import MachineScene, { type Machine, type Part } from './anatomy3d/MachineScene'

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

  const info = INFO[machine][part]

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
        <div className="relative h-72 w-full max-w-sm shrink-0 touch-none sm:h-80">
          <MachineScene machine={machine} part={part} onSelect={setPart} />
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-zinc-400">
            arrastra para rotar · corte revela el interior
          </span>
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
