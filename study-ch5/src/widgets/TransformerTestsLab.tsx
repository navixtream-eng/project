import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

/** Transformador de referencia: 50 kVA, 2400:240 V (parámetros referidos al primario) */
const VN = 2400
const SN = 50000
const IN = SN / VN // 20.83 A

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Los dos ensayos del transformador.
 * Circuito abierto (tensión nominal, corriente diminuta): la serie casi no
 * cae y los instrumentos ven SOLO la rama de excitación (Rc, Xm).
 * Cortocircuito (corriente nominal, tensión diminuta): la excitación casi
 * no toma y los instrumentos ven SOLO la serie (Req, Xeq).
 * Mueve los parámetros «verdaderos» y mira a los instrumentos delatarlos.
 */
export default function TransformerTestsLab() {
  const [test, setTest] = useState<'oc' | 'sc'>('oc')
  const [Rc, setRc] = useState(57.6) // kΩ
  const [Xm, setXm] = useState(12.0) // kΩ
  const [Req, setReq] = useState(4.0) // Ω
  const [Xeq, setXeq] = useState(9.0) // Ω

  // Ensayo OC: V nominal aplicado; la serie es despreciable frente a Rc∥Xm
  const Ioc = VN * Math.hypot(1 / (Rc * 1000), 1 / (Xm * 1000))
  const Poc = (VN * VN) / (Rc * 1000)
  // Ensayo SC: corriente nominal; la excitación es despreciable
  const Zeq = Math.hypot(Req, Xeq)
  const Vsc = IN * Zeq
  const Psc = IN * IN * Req

  // Lo que el estudiante DERIVA de los instrumentos
  const RcDer = (VN * VN) / Poc / 1000
  const IcDer = VN / (RcDer * 1000)
  const ImDer = Math.sqrt(Math.max(0, Ioc * Ioc - IcDer * IcDer))
  const XmDer = VN / ImDer / 1000
  const ReqDer = Psc / (IN * IN)
  const ZeqDer = Vsc / IN
  const XeqDer = Math.sqrt(Math.max(0, ZeqDer * ZeqDer - ReqDer * ReqDer))

  const isOC = test === 'oc'

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Ensayos OC y SC — los instrumentos delatan al circuito
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <div className="flex gap-1">
          <button type="button" onClick={() => setTest('oc')}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
              isOC ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            Circuito abierto (V nominal)
          </button>
          <button type="button" onClick={() => setTest('sc')}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
              !isOC ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            Cortocircuito (I nominal)
          </button>
        </div>
        <span className="text-[10px] text-zinc-500">
          Transformador: {SN / 1000} kVA, {VN} V (todo referido al primario)
        </span>
      </div>

      {/* Parámetros verdaderos: los que el ensayo debe descubrir */}
      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        <label className={`flex items-center gap-2 ${isOC ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <span className="w-28 font-semibold text-violet-300">Rc (núcleo)</span>
          <input type="range" min={20} max={120} step={1} value={Rc}
            onChange={(e) => setRc(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono">{Rc.toFixed(0)} kΩ</span>
        </label>
        <label className={`flex items-center gap-2 ${isOC ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <span className="w-28 font-semibold text-violet-300">Xm (magnetiz.)</span>
          <input type="range" min={4} max={30} step={0.5} value={Xm}
            onChange={(e) => setXm(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono">{Xm.toFixed(1)} kΩ</span>
        </label>
        <label className={`flex items-center gap-2 ${!isOC ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <span className="w-28 font-semibold text-amber-300">Req (cobre)</span>
          <input type="range" min={1} max={10} step={0.1} value={Req}
            onChange={(e) => setReq(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono">{Req.toFixed(1)} Ω</span>
        </label>
        <label className={`flex items-center gap-2 ${!isOC ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <span className="w-28 font-semibold text-amber-300">Xeq (dispersión)</span>
          <input type="range" min={2} max={20} step={0.1} value={Xeq}
            onChange={(e) => setXeq(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono">{Xeq.toFixed(1)} Ω</span>
        </label>
      </div>

      {/* Instrumentos */}
      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="rounded-xl border-2 border-sky-500/40 bg-zinc-950/60 p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-sky-400">Voltímetro</p>
          <p className="font-mono text-2xl font-black text-sky-300">
            {isOC ? VN.toFixed(0) : Vsc.toFixed(1)} <span className="text-sm">V</span>
          </p>
          <p className="text-[10px] text-zinc-500">{isOC ? 'nominal aplicado' : 'apenas lo justo'}</p>
        </div>
        <div className="rounded-xl border-2 border-amber-500/40 bg-zinc-950/60 p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-amber-400">Amperímetro</p>
          <p className="font-mono text-2xl font-black text-amber-300">
            {isOC ? Ioc.toFixed(3) : IN.toFixed(2)} <span className="text-sm">A</span>
          </p>
          <p className="text-[10px] text-zinc-500">{isOC ? `${((Ioc / IN) * 100).toFixed(1)}% de la nominal` : 'nominal alcanzada'}</p>
        </div>
        <div className="rounded-xl border-2 border-red-500/40 bg-zinc-950/60 p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-red-400">Wattmetro</p>
          <p className="font-mono text-2xl font-black text-red-300">
            {(isOC ? Poc : Psc).toFixed(0)} <span className="text-sm">W</span>
          </p>
          <p className="text-[10px] text-zinc-500">{isOC ? 'pérdidas del HIERRO' : 'pérdidas del COBRE'}</p>
        </div>
      </div>

      {/* Derivación */}
      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        {isOC ? (
          <>
            <Readout label="Rc = V²/P" value={`${RcDer.toFixed(1)} kΩ`} accent="text-violet-300" />
            <Readout label="Ic = V/Rc" value={`${IcDer.toFixed(3)} A`} />
            <Readout label="Im = √(I²−Ic²)" value={`${ImDer.toFixed(3)} A`} />
            <Readout label="Xm = V/Im" value={`${XmDer.toFixed(1)} kΩ`} accent="text-violet-300" />
          </>
        ) : (
          <>
            <Readout label="Req = P/I²" value={`${ReqDer.toFixed(2)} Ω`} accent="text-amber-300" />
            <Readout label="Zeq = V/I" value={`${ZeqDer.toFixed(2)} Ω`} />
            <Readout label="Xeq = √(Z²−R²)" value={`${XeqDer.toFixed(2)} Ω`} accent="text-amber-300" />
            <Readout label="Verificación" value="≡ valores verdaderos ✓" accent="text-emerald-300" />
          </>
        )}
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) en OC mueve Req y Xeq (los sliders atenuados): los instrumentos NI SE ENTERAN — con
        corriente al {((Ioc / IN) * 100).toFixed(0)}% de la nominal, la caída serie es invisible, por
        eso el ensayo aísla la rama de excitación; (2) cambia a SC y mueve Rc/Xm: misma sordera al
        revés — con ~{((Vsc / VN) * 100).toFixed(0)}% de la tensión nominal, la excitación no toma
        corriente apreciable; (3) el wattmetro cuenta la historia térmica: en OC mide el HIERRO
        (histéresis+Foucault del Cap. 1), en SC mide el COBRE (I²R) — los dos sumandos de la
        eficiencia de la Sección 3.
      </footer>
    </div>
  )
}
