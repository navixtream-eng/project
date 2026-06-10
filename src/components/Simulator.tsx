import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Atom,
  ClipboardList,
  LineChart as LineChartIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Waves,
} from 'lucide-react'
import type { EventConfig, MachineParams, OperatingPoint, SimResult } from '../engine/types'
import { runSimulation } from '../engine/MathEngine'
import {
  DEFAULT_EVENT,
  DEFAULT_MACHINE,
  DEFAULT_OPERATING_POINT,
  DEFAULT_SIM_CONFIG,
} from '../engine/defaults'
import ControlPanel from './ControlPanel'
import VectorCanvas from './VectorCanvas'
import PowerAngleChart from './PowerAngleChart'
import SwingChart from './SwingChart'
import CurrentsChart from './CurrentsChart'
import EngineeringReport from './EngineeringReport'
import PlaybackControls from './PlaybackControls'

type TabId = 'physics' | 'math' | 'engineering'

const TABS: { id: TabId; label: string; icon: typeof Atom }[] = [
  { id: 'physics', label: 'Visión Física', icon: Atom },
  { id: 'math', label: 'Visión Matemática', icon: LineChartIcon },
  { id: 'engineering', label: 'Visión de Ingeniería', icon: ClipboardList },
]

/**
 * Dashboard principal del simulador de transitorios de la máquina sincrónica.
 * Orquesta el panel de control, el motor de simulación y las tres vistas
 * (física, matemática e ingeniería) con un reloj de reproducción común.
 */
export default function Simulator() {
  const [machine, setMachine] = useState<MachineParams>(DEFAULT_MACHINE)
  const [op, setOp] = useState<OperatingPoint>(DEFAULT_OPERATING_POINT)
  const [event, setEvent] = useState<EventConfig>(DEFAULT_EVENT)

  const [result, setResult] = useState<SimResult | null>(null)
  const [tab, setTab] = useState<TabId>('physics')
  const [panelOpen, setPanelOpen] = useState(true)

  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(0.5)

  const tEnd = result?.config.tEnd ?? DEFAULT_SIM_CONFIG.tEnd

  const simulate = useCallback(() => {
    const res = runSimulation({
      ...DEFAULT_SIM_CONFIG,
      machine,
      op,
      event,
    })
    setResult(res)
    setTime(0)
    setPlaying(true)
  }, [machine, op, event])

  // Reloj de reproducción: avanza el cursor temporal con requestAnimationFrame.
  const lastFrame = useRef<number | null>(null)
  useEffect(() => {
    if (!playing || !result) return
    let raf = 0
    const step = (now: number) => {
      const dtReal = lastFrame.current === null ? 0 : (now - lastFrame.current) / 1000
      lastFrame.current = now
      setTime((t) => {
        const nt = t + dtReal * speed
        if (nt >= result.config.tEnd) {
          setPlaying(false)
          return result.config.tEnd
        }
        return nt
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      lastFrame.current = null
    }
  }, [playing, speed, result])

  const handleResetDefaults = () => {
    setMachine(DEFAULT_MACHINE)
    setOp(DEFAULT_OPERATING_POINT)
    setEvent(DEFAULT_EVENT)
  }

  const statusBadge = result ? (
    result.stable ? (
      <span className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
        ● ESTABLE
      </span>
    ) : (
      <span className="animate-pulse rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-300">
        ● INESTABLE
      </span>
    )
  ) : (
    <span className="rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-[11px] font-semibold text-zinc-400">
      ○ SIN SIMULAR
    </span>
  )

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Encabezado */}
      <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/70 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className="text-zinc-400 transition-colors hover:text-emerald-400"
          aria-label="Mostrar/ocultar panel de control"
        >
          {panelOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
        <Waves size={22} className="text-emerald-400" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold tracking-wide sm:text-base">
            SyncLab · Transitorios de la Máquina Sincrónica
          </h1>
          <p className="hidden text-[11px] text-zinc-500 sm:block">
            Generador sincrónico contra barra infinita — ecuación de oscilación, criterio de áreas iguales y corrientes de falla
          </p>
        </div>
        {statusBadge}
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Panel de control lateral */}
        <aside
          className={`shrink-0 border-r border-zinc-800 bg-zinc-950/80 transition-all duration-200 ${
            panelOpen ? 'w-80' : 'w-0 overflow-hidden border-r-0'
          }`}
        >
          <ControlPanel
            machine={machine}
            op={op}
            event={event}
            running={result !== null}
            onMachineChange={setMachine}
            onOpChange={setOp}
            onEventChange={setEvent}
            onSimulate={simulate}
            onResetDefaults={handleResetDefaults}
          />
        </aside>

        {/* Área principal */}
        <main className="flex min-w-0 flex-1 flex-col gap-3 p-3">
          {/* Pestañas */}
          <nav className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/70 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  tab === id
                    ? 'bg-zinc-800 text-emerald-300 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>

          <PlaybackControls
            time={time}
            tEnd={tEnd}
            playing={playing}
            speed={speed}
            disabled={result === null}
            onPlayPause={() => setPlaying((v) => !v)}
            onReset={() => {
              setTime(0)
              setPlaying(false)
            }}
            onSpeedChange={setSpeed}
            onSeek={(t) => {
              setPlaying(false)
              setTime(t)
            }}
          />

          {/* Contenido de la pestaña activa */}
          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/40 p-2">
            {tab === 'physics' && (
              <div className="h-full min-h-96">
                <VectorCanvas result={result} time={time} />
              </div>
            )}

            {tab === 'math' &&
              (result ? (
                <div className="grid h-full grid-cols-1 gap-3 xl:grid-cols-2 xl:grid-rows-2">
                  <div className="flex h-80 flex-col rounded-lg border border-zinc-800 bg-zinc-950/50 p-2 xl:h-auto">
                    <h3 className="mb-1 px-2 text-xs font-semibold text-zinc-400">
                      Curva Potencia–Ángulo y criterio de áreas iguales
                    </h3>
                    <div className="min-h-0 flex-1">
                      <PowerAngleChart result={result} time={time} />
                    </div>
                  </div>
                  <div className="flex h-80 flex-col rounded-lg border border-zinc-800 bg-zinc-950/50 p-2 xl:h-auto">
                    <h3 className="mb-1 px-2 text-xs font-semibold text-zinc-400">
                      Oscilación del rotor: δ(t) y Δω(t)
                    </h3>
                    <div className="min-h-0 flex-1">
                      <SwingChart result={result} time={time} />
                    </div>
                  </div>
                  <div className="flex h-80 flex-col rounded-lg border border-zinc-800 bg-zinc-950/50 p-2 xl:col-span-2 xl:h-auto">
                    <h3 className="mb-1 px-2 text-xs font-semibold text-zinc-400">
                      Corrientes de estator ia, ib, ic — componentes subtransitoria, transitoria y offset DC
                    </h3>
                    <div className="min-h-0 flex-1">
                      <CurrentsChart result={result} time={time} />
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState />
              ))}

            {tab === 'engineering' &&
              (result ? <EngineeringReport result={result} time={time} /> : <EmptyState />)}
          </div>
        </main>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-96 flex-col items-center justify-center gap-2 text-zinc-600">
      <Waves size={40} />
      <p className="text-sm">Configura los parámetros y presiona «Simular» para generar los resultados.</p>
    </div>
  )
}
