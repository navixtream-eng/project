import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { dcEmf, dcKa, dcTorque, fmt } from '../lib/machine'

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — La constante de la armadura y la doble ecuación.
 * Un mismo número, Ka·Φ, gobierna las DOS conversiones: tensión↔velocidad
 * (Ea = Ka·Φ·ω) y par↔corriente (T = Ka·Φ·Ia). Y la potencia se conserva:
 * Ea·Ia = T·ω.
 */
export default function MachineConstantLab() {
  const [P, setP] = useState(4)
  const [Z, setZ] = useState(500)
  const [a, setA] = useState(2)
  const [phi, setPhi] = useState(0.02) // Wb por polo
  const [rpm, setRpm] = useState(1200)
  const [Ia, setIa] = useState(40)

  const Ka = dcKa(P, Z, a)
  const kPhi = Ka * phi
  const omega = (rpm * 2 * Math.PI) / 60
  const Ea = dcEmf(Ka, phi, omega)
  const T = dcTorque(Ka, phi, Ia)
  const Pelec = Ea * Ia
  const Pmech = T * omega

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Ka·Φ: una constante, dos conversiones
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-3">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 text-zinc-500">P (polos)</span>
          <input type="range" min={2} max={8} step={2} value={P} onChange={(e) => setP(Number(e.target.value))} className="flex-1" />
          <span className="w-8 font-mono text-zinc-200">{P}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 text-zinc-500">Z (conduct.)</span>
          <input type="range" min={100} max={1000} step={20} value={Z} onChange={(e) => setZ(Number(e.target.value))} className="flex-1" />
          <span className="w-10 font-mono text-zinc-200">{Z}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 text-zinc-500">a (caminos)</span>
          <input type="range" min={1} max={8} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} className="flex-1" />
          <span className="w-8 font-mono text-zinc-200">{a}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-emerald-300">Φ (Wb/polo)</span>
          <input type="range" min={0.005} max={0.04} step={0.001} value={phi} onChange={(e) => setPhi(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{phi.toFixed(3)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-sky-300">n (r/min)</span>
          <input type="range" min={0} max={2500} step={20} value={rpm} onChange={(e) => setRpm(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{rpm}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-orange-300">Ia (A)</span>
          <input type="range" min={0} max={100} step={1} value={Ia} onChange={(e) => setIa(Number(e.target.value))} className="flex-1" />
          <span className="w-10 font-mono text-zinc-200">{Ia}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3">
        <Readout label="Ka = P·Z/(2π·a)" value={fmt(Ka, 1)} accent="text-zinc-100" />
        <Readout label="Ka·Φ (la constante)" value={`${fmt(kPhi, 3)} V·s/rad`} accent="text-violet-300" />
        <div className="hidden sm:block" />
        <div className="col-span-2 rounded-lg border border-sky-500/30 bg-sky-500/5 px-3 py-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-wide text-sky-400">Lado eléctrico → velocidad</p>
          <p className="font-mono text-sm font-semibold text-sky-200">Ea = Ka·Φ·ω = {fmt(Ea, 1)} V</p>
        </div>
        <div className="col-span-2 rounded-lg border border-orange-500/30 bg-orange-500/5 px-3 py-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-wide text-orange-400">Lado mecánico ← corriente</p>
          <p className="font-mono text-sm font-semibold text-orange-200">T = Ka·Φ·Ia = {fmt(T, 1)} N·m</p>
        </div>
        <div className="col-span-2 rounded-lg border border-violet-500/30 bg-violet-500/5 px-3 py-2 sm:col-span-3">
          <p className="text-[10px] uppercase tracking-wide text-violet-400">Conservación de la potencia convertida</p>
          <p className="font-mono text-sm font-semibold text-violet-200">
            Ea·Ia = {fmt(Pelec / 1000, 2)} kW &nbsp;=&nbsp; T·ω = {fmt(Pmech / 1000, 2)} kW ✓
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) el MISMO factor <span className="text-violet-300">Ka·Φ</span> aparece en las dos ecuaciones:
        multiplica a la velocidad para dar tensión, y a la corriente para dar par — dos caras de la
        misma conversión; (2) sube <span className="text-emerald-300">Φ</span> y mira crecer Ea Y T a la
        vez: el flujo es la «palanca» común; (3) comprueba que Ea·Ia = T·ω SIEMPRE: la potencia
        eléctrica convertida en el entrehierro es idéntica a la mecánica — la máquina no crea ni destruye
        energía, solo la transforma.
      </footer>
    </div>
  )
}
