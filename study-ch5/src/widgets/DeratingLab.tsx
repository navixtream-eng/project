import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { derateAltitud, derateAmbiente, derateArmonicos, derateDesbalance } from '../lib/termica'

/**
 * Laboratorio — Derrateo: la placa promete en condiciones de referencia.
 * Altitud, temperatura, desbalance y armónicos degradan el enfriamiento o
 * añaden pérdidas: cada uno multiplica un factor < 1. La cascada muestra
 * cuánta placa queda realmente disponible en TU instalación.
 */
export default function DeratingLab() {
  const [pkw, setPkw] = useState(45)
  const [alt, setAlt] = useState(1000)
  const [tamb, setTamb] = useState(40)
  const [v2, setV2] = useState(0)
  const [thd, setThd] = useState(0)

  const f1 = derateAltitud(alt)
  const f2 = derateAmbiente(tamb)
  const f3 = derateDesbalance(v2)
  const f4 = derateArmonicos(thd)
  const fTotal = f1 * f2 * f3 * f4
  const pUtil = pkw * fTotal

  const factores = [
    { nombre: `Altitud ${alt} m`, f: f1, color: '#38bdf8', regla: '−1 %/100 m sobre 1000' },
    { nombre: `Ambiente ${tamb} °C`, f: f2, color: '#f59e0b', regla: '−1 %/°C sobre 40' },
    { nombre: `Desbalance ${v2} %`, f: f3, color: '#f472b6', regla: '≈1−(V₂%)²/100 (NEMA)' },
    { nombre: `THD ${thd} %`, f: f4, color: '#a78bfa', regla: '≈1−THD/200 (HVF aprox.)' },
  ]

  // Cascada: potencia que va quedando tras cada factor
  let acumulado = pkw
  const cascada = factores.map((fa) => {
    const antes = acumulado
    acumulado = acumulado * fa.f
    return { ...fa, antes, despues: acumulado }
  })

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Derrateo en cascada: de la placa a tu instalación
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-zinc-200">P de placa</span>
          <input type="range" min={11} max={90} step={1} value={pkw} onChange={(e) => setPkw(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{pkw} kW</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-sky-300">Altitud</span>
          <input type="range" min={0} max={4000} step={100} value={alt} onChange={(e) => setAlt(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{alt} m</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-amber-300">T ambiente</span>
          <input type="range" min={25} max={60} step={1} value={tamb} onChange={(e) => setTamb(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{tamb} °C</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-pink-300">Desbalance V₂/V₁</span>
          <input type="range" min={0} max={5} step={0.5} value={v2} onChange={(e) => setV2(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{v2} %</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-violet-300">THD de tensión</span>
          <input type="range" min={0} max={20} step={1} value={thd} onChange={(e) => setThd(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{thd} %</span>
        </label>
      </div>

      {/* Cascada */}
      <div className="space-y-1.5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-44 shrink-0 text-[11px] font-semibold text-zinc-200">Placa (40 °C, ≤1000 m, red limpia)</span>
          <div className="h-5 rounded bg-emerald-500/60" style={{ width: `${(pkw / 90) * 60}%` }} />
          <span className="font-mono text-xs text-zinc-200">{pkw.toFixed(1)} kW</span>
        </div>
        {cascada.map((c) => (
          <div key={c.nombre} className="flex items-center gap-2">
            <span className="w-44 shrink-0 text-[11px] text-zinc-400">
              × {c.f.toFixed(3)} · {c.nombre}
              <span className="block text-[9px] text-zinc-600">{c.regla}</span>
            </span>
            <div className="h-5 rounded" style={{ width: `${(c.despues / 90) * 60}%`, backgroundColor: c.color, opacity: 0.65 }} />
            <span className="font-mono text-xs text-zinc-300">{c.despues.toFixed(1)} kW</span>
          </div>
        ))}
        <div className="flex items-center gap-2 border-t border-zinc-800 pt-1.5">
          <span className="w-44 shrink-0 text-[11px] font-bold text-zinc-100">UTILIZABLE en sitio</span>
          <div className="h-6 rounded bg-red-500/70" style={{ width: `${(pUtil / 90) * 60}%` }} />
          <span className="font-mono text-sm font-bold text-red-300">{pUtil.toFixed(1)} kW ({(fTotal * 100).toFixed(0)} %)</span>
        </div>
      </div>

      <p className="mx-4 mb-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2.5 text-[10px] leading-relaxed text-zinc-500">
        <strong className="text-zinc-400">Aproximaciones declaradas:</strong> las cuatro reglas son
        ajustes típicos de catálogo IEC y de las curvas NEMA MG1 — cada fabricante publica las
        suyas y ESAS mandan. Además, multiplicar factores independientes puede CONTAR DOS VECES
        fenómenos relacionados (p. ej., desbalance y armónicos calientan el mismo rotor; altitud y
        temperatura interactúan en el mismo aire): el producto es una estimación práctica y algo
        conservadora, no una superposición exacta. La estructura del cálculo es universal; los
        números finales salen del catálogo o de la norma aplicable.
      </p>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) planta a 2500 m y 50 °C: solo altitud+temperatura dejan el 77 % de la placa — la
        «reserva» del motor puede evaporarse en la instalación; (2) añade 3 % de desbalance: otro
        −9 % (la curva NEMA es CUADRÁTICA: el doble de desbalance cuesta el cuádruple) — conecta
        con el Cap. 11: V₂ pequeña, corriente negativa grande; (3) THD del variador barato: el
        último factor — armónicos de tensión = pérdidas extra de hierro y cobre sin producir par;
        (4) el orden de la cascada no importa (multiplicación conmuta) pero la MORALEJA sí: el
        motor se elige con la potencia UTILIZABLE, no con la de placa — y el problema 62 te hace
        cerrar el número.
      </footer>
    </div>
  )
}
