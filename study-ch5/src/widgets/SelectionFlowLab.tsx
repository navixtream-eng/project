import { useState } from 'react'
import { CheckCircle2, FlaskConical, XCircle } from 'lucide-react'
import { CATALOGO_KW, type TipoCarga, parArranqueCarga } from '../lib/termica'

const TIPOS: { id: TipoCarga; label: string; ej: string }[] = [
  { id: 'constante', label: 'Par constante', ej: 'banda, elevador, compresor de pistón' },
  { id: 'cuadratica', label: 'Par cuadrático', ej: 'bomba centrífuga, ventilador' },
  { id: 'potencia', label: 'Potencia constante', ej: 'bobinadora, husillo de máquina' },
]

/**
 * Laboratorio — El flujo de selección completo.
 * Caracterizar la carga → potencia requerida → corregir por instalación →
 * elegir el tamaño de catálogo → VERIFICAR el arranque. Cada paso se valida
 * en vivo: la selección es un embudo con chequeos, no una fórmula.
 */
export default function SelectionFlowLab() {
  const [tipo, setTipo] = useState<TipoCarga>('cuadratica')
  const [torque, setTorque] = useState(250) // N·m a velocidad nominal
  const [rpm, setRpm] = useState(1480)
  const [fInst, setFInst] = useState(0.88) // factor combinado de instalación
  const [tArrMotor, setTArrMotor] = useState(2.2) // par de arranque del motor [× Tn]

  const w = (rpm * 2 * Math.PI) / 60
  const pCarga = (torque * w) / 1000 // kW
  const pReq = pCarga / fInst
  const elegido = CATALOGO_KW.find((c) => c >= pReq) ?? CATALOGO_KW[CATALOGO_KW.length - 1]
  const margen = ((elegido * fInst) / pCarga - 1) * 100
  // Verificación de arranque: par disponible del motor elegido vs par resistente
  const tnMotor = (elegido * 1000) / w // N·m nominales del motor elegido
  const tArrDisp = tArrMotor * tnMotor
  const tArrNec = parArranqueCarga(tipo) * torque
  const margenArr = tArrDisp / Math.max(1, tArrNec)
  const arranqueOk = margenArr >= 1.3

  const pasos = [
    { label: `1 · Caracterizar: ${TIPOS.find((t) => t.id === tipo)?.label}`, ok: true },
    { label: `2 · P de la carga: ${pCarga.toFixed(1)} kW`, ok: true },
    { label: `3 · Corregir instalación (÷${fInst.toFixed(2)}): ${pReq.toFixed(1)} kW`, ok: true },
    { label: `4 · Catálogo: ${elegido} kW`, ok: elegido * fInst >= pCarga },
    { label: `5 · Verificar arranque (×${margenArr.toFixed(1)})`, ok: arranqueOk },
  ]

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Selección: el embudo con chequeos
        </h4>
      </header>

      {/* Flujo como cadena validada */}
      <div className="border-b border-zinc-800 px-4 py-2.5">
        <ol className="flex flex-wrap items-center gap-1.5">
          {pasos.map((p, i) => (
            <li key={p.label} className="flex items-center gap-1.5">
              <span className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold ${
                p.ok ? 'border-emerald-600/60 bg-emerald-500/10 text-emerald-300' : 'border-red-600/60 bg-red-500/10 text-red-300'
              }`}>
                {p.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {p.label}
              </span>
              {i < pasos.length - 1 && <span className="text-zinc-600">→</span>}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tipo de carga:</span>
          {TIPOS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTipo(t.id)}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold ${tipo === t.id ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}
              title={t.ej}>
              {t.label}
            </button>
          ))}
          <span className="text-[10px] text-zinc-600">({TIPOS.find((t) => t.id === tipo)?.ej})</span>
        </div>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-amber-300">Par a velocidad</span>
          <input type="range" min={100} max={500} step={10} value={torque} onChange={(e) => setTorque(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{torque} N·m</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-sky-300">Velocidad</span>
          <input type="range" min={730} max={2960} step={10} value={rpm} onChange={(e) => setRpm(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{rpm} r/min</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-pink-300">Factor instalación</span>
          <input type="range" min={0.7} max={1} step={0.01} value={fInst} onChange={(e) => setFInst(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{fInst.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-violet-300">T_arr motor</span>
          <input type="range" min={1.2} max={3} step={0.1} value={tArrMotor} onChange={(e) => setTArrMotor(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{tArrMotor.toFixed(1)}·Tn</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 py-3 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">P de la carga</p>
          <p className="font-mono text-sm font-semibold text-amber-300">{pCarga.toFixed(1)} kW</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Requerida de placa</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">{pReq.toFixed(1)} kW</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Elegido / margen</p>
          <p className="font-mono text-sm font-semibold text-emerald-300">{elegido} kW · {margen.toFixed(0)} %</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Arranque disp./nec.</p>
          <p className={`font-mono text-sm font-semibold ${arranqueOk ? 'text-emerald-300' : 'text-red-300'}`}>
            {tArrDisp.toFixed(0)}/{tArrNec.toFixed(0)} N·m {arranqueOk ? '✓' : '⚠'}
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) bomba centrífuga (cuadrática): al arranque solo pide ~15 % del par — casi cualquier
        motor la arranca: el chequeo 5 pasa holgado; (2) cámbiala a PAR CONSTANTE con el mismo par:
        ahora el arranque exige el 100 % + margen — baja T_arr del motor a 1.4 (arrancador suave
        mal ajustado) y mira el paso 5 fallar: la selección por potencia era correcta ¡y el motor
        no arranca!; (3) empeora el factor de instalación a 0.75 (altura + calor del lab anterior):
        el catálogo salta uno o dos tamaños — el derrateo se paga en hierro; (4) regla del margen:
        ni justo (sin reserva térmica) ni doble (rendimiento y fp de un motor al 40 % son malos) —
        un dígito porcentual alto de holgura tras derrateo es el punto sano.
      </footer>
    </div>
  )
}
