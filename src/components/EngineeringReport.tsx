import type { ReactNode } from 'react'
import {
  AlertTriangle,
  BookOpenText,
  CheckCircle2,
  Clock4,
  Scale,
  Sigma,
  XCircle,
} from 'lucide-react'
import type { SimResult } from '../engine/types'
import { toDeg } from '../engine/MathEngine'

interface EngineeringReportProps {
  result: SimResult
  time: number
}

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
        {icon}
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-zinc-300">{children}</div>
    </section>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-base font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Visión de ingeniería: diagnóstico de estabilidad, márgenes del criterio de
 * áreas iguales, tiempo crítico de despeje y lectura didáctica del fenómeno.
 */
export default function EngineeringReport({ result, time }: EngineeringReportProps) {
  const { config, init, equalArea, tCritical, scLevels } = result
  const ev = config.event
  const isSC = ev.type === 'short-circuit'
  const isLoadRej = ev.type === 'load-rejection'

  const idx = Math.min(result.samples.length - 1, Math.max(0, Math.round(time / config.dt)))
  const s = result.samples[idx]

  const margin =
    isSC && tCritical !== null ? tCritical - ev.tClearing : null

  const statusBanner = !result.stable ? (
    <div className="flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/10 p-4">
      <XCircle className="shrink-0 text-red-400" size={28} />
      <div>
        <p className="text-base font-bold text-red-300">SISTEMA INESTABLE — PÉRDIDA DE SINCRONISMO</p>
        <p className="text-xs text-red-200/80">
          El rotor superó los 180° con velocidad creciente en t ≈ {result.lossOfSyncTime?.toFixed(2)} s.
          El generador desliza polos y debe ser desconectado por la protección de pérdida de paso (78).
        </p>
      </div>
    </div>
  ) : isLoadRej ? (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
      <AlertTriangle className="shrink-0 text-amber-400" size={28} />
      <div>
        <p className="text-base font-bold text-amber-300">RECHAZO DE CARGA — SOBREVELOCIDAD</p>
        <p className="text-xs text-amber-200/80">
          Sin par eléctrico resistente, la turbina acelera el rotor (Δω máx = {result.maxDOmega.toFixed(2)} rad/s
          ≈ {((result.maxDOmega / (2 * Math.PI * config.machine.f)) * 100).toFixed(1)}% de sobrevelocidad).
          En la práctica actúa el regulador de velocidad y, si falla, la protección de sobrevelocidad mecánica.
        </p>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4">
      <CheckCircle2 className="shrink-0 text-emerald-400" size={28} />
      <div>
        <p className="text-base font-bold text-emerald-300">SISTEMA ESTABLE</p>
        <p className="text-xs text-emerald-200/80">
          El rotor oscila alrededor del nuevo punto de equilibrio y el amortiguamiento (D = {config.machine.D}) disipa
          la energía de la perturbación. Excursión máxima: δmáx = {toDeg(result.maxDelta).toFixed(1)}°.
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 overflow-y-auto p-1">
      {statusBanner}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="δ₀ inicial" value={`${toDeg(init.delta0).toFixed(1)}°`} />
        <Stat label="E′q interna" value={`${init.Eq1.toFixed(3)} pu`} />
        <Stat label="δ máx" value={`${toDeg(result.maxDelta).toFixed(1)}°`} accent={result.stable ? 'text-emerald-400' : 'text-red-400'} />
        <Stat label="Δω máx" value={`${result.maxDOmega.toFixed(2)} rad/s`} accent={result.maxDOmega > 5 ? 'text-amber-400' : undefined} />
      </div>

      {isSC && (
        <Card title="Tiempo crítico de despeje" icon={<Clock4 size={14} className="text-amber-400" />}>
          {tCritical === null ? (
            <p>
              Con estos parámetros el sistema permanece estable incluso con despejes de hasta 1.5 s:
              el punto de operación es muy holgado (P₀ bajo o H alta).
            </p>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Stat label="t_cr calculado" value={`${tCritical.toFixed(3)} s`} accent="text-amber-400" />
                <Stat label="t_clearing usado" value={`${ev.tClearing.toFixed(3)} s`} />
                <Stat
                  label="Margen"
                  value={`${margin !== null ? (margin >= 0 ? '+' : '') + margin.toFixed(3) : '—'} s`}
                  accent={margin !== null && margin >= 0 ? 'text-emerald-400' : 'text-red-400'}
                />
              </div>
              <p className="text-xs text-zinc-400">
                t_cr se obtuvo por bisección sobre la integración RK4 de la ecuación de oscilación: es el mayor
                tiempo de despeje que aún conserva el sincronismo. {margin !== null && margin < 0
                  ? 'El despeje configurado supera el crítico: las protecciones llegan tarde y la máquina desliza polos.'
                  : 'El despeje configurado es más rápido que el crítico: el sistema sobrevive a la falla.'}
              </p>
            </>
          )}
        </Card>
      )}

      {isSC && equalArea && (
        <Card title="Criterio de áreas iguales" icon={<Scale size={14} className="text-emerald-400" />}>
          <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="A1 (aceleración)" value={`${equalArea.A1.toFixed(3)} pu·rad`} accent="text-red-400" />
            <Stat label="A2 máx (frenado)" value={`${equalArea.A2max.toFixed(3)} pu·rad`} accent="text-emerald-400" />
            <Stat label="δ de despeje" value={`${toDeg(equalArea.deltaClear).toFixed(1)}°`} />
            <Stat
              label="δ crítico"
              value={equalArea.deltaCritical !== null ? `${toDeg(equalArea.deltaCritical).toFixed(1)}°` : '—'}
              accent="text-amber-400"
            />
          </div>
          <p className="text-xs text-zinc-400">
            Durante la falla, Pm &gt; Pe y el rotor gana energía cinética proporcional al área A1. Tras el despeje,
            el rotor frena mientras Pe &gt; Pm, disponiendo del área A2 hasta el equilibrio inestable
            δu = {equalArea.deltaUnstableEq !== null ? toDeg(equalArea.deltaUnstableEq).toFixed(1) : '—'}°.{' '}
            {equalArea.A1 <= equalArea.A2max
              ? `Como A1 ≤ A2,máx (relación ${(equalArea.A2max > 0 ? equalArea.A1 / equalArea.A2max : 0).toFixed(2)}), el sistema es transitoriamente estable.`
              : 'Como A1 > A2,máx, la energía cinética ganada no puede absorberse: pérdida de sincronismo.'}
          </p>
        </Card>
      )}

      {isSC && (
        <Card title="Niveles de corriente de cortocircuito" icon={<Sigma size={14} className="text-red-400" />}>
          <div className="mb-2 grid grid-cols-3 gap-2">
            <Stat label='I″ subtransitoria' value={`${scLevels.Isub.toFixed(2)} pu`} accent="text-red-400" />
            <Stat label="I′ transitoria" value={`${scLevels.Itrans.toFixed(2)} pu`} accent="text-amber-400" />
            <Stat label="Iss permanente" value={`${scLevels.Iss.toFixed(2)} pu`} accent="text-emerald-400" />
          </div>
          <p className="text-xs text-zinc-400">
            I″ = E″q/X″d dimensiona el poder de corte de los interruptores y los esfuerzos electrodinámicos;
            decae con T″d = {config.machine.Td2} s (devanados amortiguadores). I′ = E′q/X′d decae con
            T′d = {config.machine.Td1} s (devanado de campo). El offset DC por fase decae con Ta = {config.machine.Ta} s
            y produce la asimetría visible en el gráfico de corrientes.
          </p>
        </Card>
      )}

      <Card title="Lectura didáctica del fenómeno" icon={<BookOpenText size={14} className="text-sky-400" />}>
        {ev.type === 'short-circuit' && (
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-zinc-400">
            <li>
              <span className="text-zinc-200">t &lt; {ev.tFault} s (pre-falla):</span> la máquina opera en equilibrio,
              Pm = Pe en δ₀ = {toDeg(init.delta0).toFixed(1)}°.
            </li>
            <li>
              <span className="text-red-300">Falla ({ev.tFault} s → {(ev.tFault + ev.tClearing).toFixed(2)} s):</span>{' '}
              con Vt ≈ 0 la máquina no puede evacuar potencia (Pe ≈ 0). Toda la potencia de la turbina acelera
              el rotor: δ y Δω crecen (área A1 en la curva P-δ).
            </li>
            <li>
              <span className="text-amber-300">Post-despeje:</span> se restituye la red y Pe vuelve a la curva sinusoidal.
              Si la energía cinética acumulada puede absorberse antes de δu (criterio de áreas iguales), el rotor oscila
              y el amortiguamiento lleva el sistema de regreso a δ₀; si no, desliza polos.
            </li>
            <li>
              <span className="text-zinc-200">Regla práctica:</span> aumenta H, reduce P₀ o despeja más rápido
              (t_clearing ↓) para ganar margen de estabilidad. Experimenta con los sliders y compáralo con t_cr.
            </li>
          </ul>
        )}
        {ev.type === 'load-rejection' && (
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-zinc-400">
            <li>
              Al abrir el interruptor la potencia eléctrica cae a cero pero la turbina sigue entregando
              Pm = {config.op.P0} pu: el exceso íntegro acelera el rotor.
            </li>
            <li>
              La aceleración inicial vale dΔω/dt = ωs·Pm/(2H) — observa cómo crece linealmente Δω en el gráfico de
              oscilación hasta que el término D·Δω/ωs equilibra a Pm.
            </li>
            <li>
              En centrales reales el regulador de velocidad (governor) cierra el distribuidor/las válvulas en
              segundos; este simulador no lo modela para evidenciar el riesgo de embalamiento.
            </li>
          </ul>
        )}
        {ev.type === 'torque-step' && (
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-zinc-400">
            <li>
              El escalón ΔPm = {ev.torqueStep} pu desplaza el punto de equilibrio sobre la misma curva P-δ:
              el rotor avanza hacia el nuevo δ de equilibrio y lo sobrepasa (sobreoscilación) por su inercia.
            </li>
            <li>
              Las oscilaciones decaen con la constante de amortiguamiento D; sin amortiguamiento el rotor
              oscilaría indefinidamente alrededor del nuevo equilibrio.
            </li>
            <li>
              Si Pm final supera el máximo de la curva Pe(δ), no existe punto de equilibrio y la máquina
              pierde el sincronismo de forma aperiódica. Pruébalo subiendo ΔPm.
            </li>
          </ul>
        )}
      </Card>

      <Card title="Estado instantáneo (cursor de tiempo)" icon={<Clock4 size={14} className="text-zinc-400" />}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Stat label="t" value={`${s.t.toFixed(2)} s`} />
          <Stat label="δ(t)" value={`${toDeg(s.delta).toFixed(1)}°`} />
          <Stat label="Δω(t)" value={`${s.dOmega.toFixed(3)} rad/s`} />
          <Stat label="Pe(t)" value={`${s.Pe.toFixed(3)} pu`} />
          <Stat label="Pm(t)" value={`${s.Pm.toFixed(3)} pu`} />
        </div>
      </Card>
    </div>
  )
}
