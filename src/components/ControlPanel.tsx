import type { ReactNode } from 'react'
import {
  Activity,
  Cog,
  Gauge,
  Play,
  RotateCcw,
  Zap,
  ZapOff,
  ArrowBigUpDash,
} from 'lucide-react'
import type { EventConfig, EventType, MachineParams, OperatingPoint } from '../engine/types'
import Tooltip from './Tooltip'

interface ControlPanelProps {
  machine: MachineParams
  op: OperatingPoint
  event: EventConfig
  running: boolean
  onMachineChange: (m: MachineParams) => void
  onOpChange: (op: OperatingPoint) => void
  onEventChange: (ev: EventConfig) => void
  onSimulate: () => void
  onResetDefaults: () => void
}

interface FieldProps {
  label: ReactNode
  tooltip: ReactNode
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}

function Field({ label, tooltip, value, min, max, step, unit, onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
        {label}
        <Tooltip text={tooltip} />
      </span>
      <span className="mt-1 flex items-center gap-2">
        <input
          type="range"
          className="flex-1"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          type="number"
          className="w-20 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-right text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit && <span className="w-6 text-[10px] text-zinc-500">{unit}</span>}
      </span>
    </label>
  )
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

const EVENT_OPTIONS: { type: EventType; label: string; icon: ReactNode; desc: string }[] = [
  {
    type: 'short-circuit',
    label: 'Cortocircuito 3φ',
    icon: <Zap size={14} />,
    desc: 'Falla trifásica franca en bornes del generador. Pe cae a cero y el rotor acelera.',
  },
  {
    type: 'load-rejection',
    label: 'Pérdida de carga',
    icon: <ZapOff size={14} />,
    desc: 'Apertura del interruptor principal. La máquina queda en vacío y tiende a embalar.',
  },
  {
    type: 'torque-step',
    label: 'Escalón de torque',
    icon: <ArrowBigUpDash size={14} />,
    desc: 'Incremento súbito de la potencia mecánica de la turbina (ΔPm).',
  },
]

export default function ControlPanel({
  machine,
  op,
  event,
  running,
  onMachineChange,
  onOpChange,
  onEventChange,
  onSimulate,
  onResetDefaults,
}: ControlPanelProps) {
  const setM = (patch: Partial<MachineParams>) => onMachineChange({ ...machine, ...patch })
  const setOp = (patch: Partial<OperatingPoint>) => onOpChange({ ...op, ...patch })
  const setEv = (patch: Partial<EventConfig>) => onEventChange({ ...event, ...patch })

  // Coherencia física: Xd ≥ X'd ≥ X''d (el flujo queda atrapado en devanados
  // amortiguadores y de campo, reduciendo la reactancia aparente).
  const reactanceWarning =
    machine.Xd < machine.Xd1 || machine.Xd1 < machine.Xd2
      ? 'Atención: físicamente debe cumplirse Xd ≥ X′d ≥ X″d.'
      : null

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <Section icon={<Cog size={14} className="text-emerald-400" />} title="Reactancias de la máquina">
        <Field
          label="Xd — sincrónica eje d"
          tooltip="Reactancia sincrónica de eje directo. Gobierna el comportamiento en régimen permanente. Valores típicos: 1.0–2.3 pu."
          value={machine.Xd} min={0.6} max={2.5} step={0.01} unit="pu"
          onChange={(v) => setM({ Xd: v })}
        />
        <Field
          label="Xq — sincrónica eje q"
          tooltip="Reactancia sincrónica de eje en cuadratura. En máquinas de polos salientes Xq < Xd, lo que genera el par de reluctancia (término sin 2δ)."
          value={machine.Xq} min={0.4} max={2.5} step={0.01} unit="pu"
          onChange={(v) => setM({ Xq: v })}
        />
        <Field
          label="X′d — transitoria eje d"
          tooltip="Reactancia transitoria de eje directo. Domina el periodo transitorio (décimas de segundo) mientras decae el flujo del devanado de campo. Típica: 0.2–0.5 pu."
          value={machine.Xd1} min={0.1} max={0.8} step={0.01} unit="pu"
          onChange={(v) => setM({ Xd1: v })}
        />
        <Field
          label="X″d — subtransitoria eje d"
          tooltip="Reactancia subtransitoria de eje directo. Es la reactancia aparente en los primeros ciclos de la falla, cuando los devanados amortiguadores aún atrapan el flujo. Determina la corriente máxima de cortocircuito I″ = E″/X″d. Típica: 0.15–0.3 pu."
          value={machine.Xd2} min={0.08} max={0.5} step={0.01} unit="pu"
          onChange={(v) => setM({ Xd2: v })}
        />
        <Field
          label="X′q — transitoria eje q"
          tooltip="Reactancia transitoria de eje en cuadratura. Relevante en máquinas de rotor liso; en polos salientes suele aproximarse a Xq."
          value={machine.Xq1} min={0.1} max={1.5} step={0.01} unit="pu"
          onChange={(v) => setM({ Xq1: v })}
        />
        <Field
          label="X″q — subtransitoria eje q"
          tooltip="Reactancia subtransitoria de eje en cuadratura, definida por los devanados amortiguadores del eje q."
          value={machine.Xq2} min={0.08} max={0.6} step={0.01} unit="pu"
          onChange={(v) => setM({ Xq2: v })}
        />
        {reactanceWarning && (
          <p className="rounded-md border border-amber-600/40 bg-amber-500/10 p-2 text-[11px] text-amber-300">
            {reactanceWarning}
          </p>
        )}
      </Section>

      <Section icon={<Gauge size={14} className="text-emerald-400" />} title="Dinámica del rotor">
        <Field
          label="H — constante de inercia"
          tooltip="Energía cinética almacenada a velocidad nominal dividida por la potencia base [s]. A mayor H, el rotor acelera más lento durante la falla y el sistema es más estable. Hidráulicas: 2–4 s; térmicas: 4–9 s."
          value={machine.H} min={1} max={10} step={0.1} unit="s"
          onChange={(v) => setM({ H: v })}
        />
        <Field
          label="D — amortiguamiento"
          tooltip="Coeficiente de par amortiguador (devanados amortiguadores + cargas sensibles a la frecuencia). Atenúa las oscilaciones del rotor tras la perturbación."
          value={machine.D} min={0} max={10} step={0.1} unit="pu"
          onChange={(v) => setM({ D: v })}
        />
        <Field
          label="T′d — cte. transitoria"
          tooltip="Constante de tiempo transitoria de cortocircuito: ritmo al que decae la componente transitoria de la corriente de falla (flujo de campo). Típica: 0.5–2 s."
          value={machine.Td1} min={0.2} max={3} step={0.05} unit="s"
          onChange={(v) => setM({ Td1: v })}
        />
        <Field
          label="T″d — cte. subtransitoria"
          tooltip="Constante de tiempo subtransitoria: decaimiento de la corriente de los devanados amortiguadores. Muy rápida: 0.02–0.05 s (1–3 ciclos)."
          value={machine.Td2} min={0.01} max={0.1} step={0.005} unit="s"
          onChange={(v) => setM({ Td2: v })}
        />
        <Field
          label="Ta — cte. de armadura"
          tooltip="Constante de tiempo de armadura: gobierna el decaimiento del offset DC (asimetría) de las corrientes de fase durante el cortocircuito."
          value={machine.Ta} min={0.05} max={0.5} step={0.01} unit="s"
          onChange={(v) => setM({ Ta: v })}
        />
      </Section>

      <Section icon={<Activity size={14} className="text-emerald-400" />} title="Punto de operación inicial">
        <Field
          label="P₀ — potencia activa"
          tooltip="Potencia activa entregada antes de la perturbación. A mayor P₀, mayor ángulo de carga inicial δ₀ y menor margen de estabilidad."
          value={op.P0} min={0.05} max={1.2} step={0.01} unit="pu"
          onChange={(v) => setOp({ P0: v })}
        />
        <Field
          label="Q₀ — potencia reactiva"
          tooltip="Potencia reactiva entregada (positiva = sobreexcitado, corriente en atraso). Aumenta la FEM interna E′q y mejora la estabilidad transitoria."
          value={op.Q0} min={-0.6} max={0.8} step={0.01} unit="pu"
          onChange={(v) => setOp({ Q0: v })}
        />
        <Field
          label="Vt — tensión en bornes"
          tooltip="Magnitud de la tensión en los bornes del estator antes de la falla, usada como fasor de referencia."
          value={op.Vt} min={0.85} max={1.1} step={0.01} unit="pu"
          onChange={(v) => setOp({ Vt: v })}
        />
      </Section>

      <Section icon={<Zap size={14} className="text-red-400" />} title="Perturbación (evento)">
        <div className="grid grid-cols-1 gap-2">
          {EVENT_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setEv({ type: opt.type })}
              className={`flex items-start gap-2 rounded-lg border p-2.5 text-left text-xs transition-colors ${
                event.type === opt.type
                  ? 'border-red-500/60 bg-red-500/10 text-red-200'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              <span className="mt-0.5">{opt.icon}</span>
              <span>
                <span className="block font-semibold">{opt.label}</span>
                <span className="block text-[10px] leading-snug opacity-80">{opt.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <Field
          label="t evento — instante de aparición"
          tooltip="Instante de la simulación en el que se aplica la perturbación."
          value={event.tFault} min={0.1} max={2} step={0.05} unit="s"
          onChange={(v) => setEv({ tFault: v })}
        />
        {event.type === 'short-circuit' && (
          <Field
            label="t_clearing — tiempo de despeje"
            tooltip="Tiempo que tardan las protecciones e interruptores en despejar la falla. Si supera el tiempo crítico t_cr, el generador pierde el sincronismo. Compáralo con el t_cr calculado en la pestaña de Ingeniería."
            value={event.tClearing} min={0.02} max={1} step={0.01} unit="s"
            onChange={(v) => setEv({ tClearing: v })}
          />
        )}
        {event.type === 'torque-step' && (
          <Field
            label="ΔPm — escalón de torque"
            tooltip="Magnitud del incremento súbito de potencia mecánica de la turbina. Si Pm supera la potencia eléctrica máxima transmisible, el generador pierde el sincronismo."
            value={event.torqueStep} min={0.05} max={1} step={0.01} unit="pu"
            onChange={(v) => setEv({ torqueStep: v })}
          />
        )}
      </Section>

      <div className="sticky bottom-0 flex gap-2 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pb-1 pt-3">
        <button
          type="button"
          onClick={onSimulate}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition-colors hover:bg-emerald-500 active:bg-emerald-700"
        >
          <Play size={16} />
          {running ? 'Re-simular' : 'Simular'}
        </button>
        <button
          type="button"
          onClick={onResetDefaults}
          title="Restaurar parámetros por defecto"
          className="flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}
