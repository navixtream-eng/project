import { useEffect, useState, type ComponentType } from 'react'
import {
  BookOpenText,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  RotateCcw,
  Zap,
} from 'lucide-react'
import { ALL_CHECK_IDS, useProgress } from './ProgressContext'
import Section1 from '../sections/Section1'
import Section2 from '../sections/Section2'
import Section3 from '../sections/Section3'
import Section4 from '../sections/Section4'
import Section5 from '../sections/Section5'
import Section6 from '../sections/Section6'

interface SectionDef {
  num: number
  /** Título corto para la pestaña */
  short: string
  title: string
  items: string[]
  component: ComponentType
}

const SECTIONS: SectionDef[] = [
  {
    num: 1,
    short: 'Campo giratorio',
    title: 'Campo giratorio y velocidad síncrona',
    items: ['El truco del imán giratorio', 'nₛ = 120f/p', 'Problema 1: central hidroeléctrica'],
    component: Section1,
  },
  {
    num: 2,
    short: 'Circuito y fasores',
    title: 'FEM interna y diagrama fasorial',
    items: ['Eaf = Vt + jXs·Ia', 'Inductancias: Ls = 3/2·Laa0 + Lal (§5.2)', 'La curva V de excitación', 'Problemas 2 y 3: sobre/subexcitado'],
    component: Section2,
  },
  {
    num: 3,
    short: 'Potencia-ángulo',
    title: 'Potencia-ángulo y barra infinita',
    items: ['P = Eaf·Vt·sen δ / Xs', 'Los dos mandos y el par sincronizante', 'Problemas 4 y 5: margen y pérdida de paso'],
    component: Section3,
  },
  {
    num: 4,
    short: 'Capacidad y motor',
    title: 'Curvas de capacidad y motor sincrónico',
    items: ['La carta de operación P-Q', 'Motor: δ < 0, el campo arrastra', 'Problemas 6 y 7: carta y compensador'],
    component: Section4,
  },
  {
    num: 5,
    short: 'Ensayos OCC/SCC',
    title: 'Ensayos OCC/SCC y saturación',
    items: ['La curva que se dobla y la recta que no', 'Xs saturada, no saturada y SCR', 'Problemas 8 y 9: parámetros del ensayo'],
    component: Section5,
  },
  {
    num: 6,
    short: 'Rendimiento',
    title: 'Pérdidas y rendimiento',
    items: ['Costos fijos vs variables', 'η máximo: variables = fijas', 'Problemas 10 y 11: desglose y punto dulce'],
    component: Section6,
  },
]

const ACTIVE_KEY = 'fku-ch5-active-section'

function loadActive(): number {
  try {
    const n = Number(localStorage.getItem(ACTIVE_KEY))
    return Number.isInteger(n) && n >= 0 && n < SECTIONS.length ? n : 0
  } catch {
    return 0
  }
}

/**
 * Cascarón del documento: navegación por PESTAÑAS (una por sección), con
 * progreso individual por pestaña, índice lateral de la sección activa y
 * botones anterior/siguiente. La sección activa persiste entre visitas.
 */
export default function StudyShell() {
  const { percent, completed, reset } = useProgress()
  const [active, setActive] = useState(loadActive)

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, String(active))
    } catch {
      /* almacenamiento no disponible: la pestaña simplemente no persiste */
    }
    window.scrollTo({ top: 0 })
  }, [active])

  /** Hitos (chequeos + problemas) de una sección: total y completados. */
  const sectionProgress = (num: number) => {
    const ids = ALL_CHECK_IDS.filter((id) => id.startsWith(`s${num}-`))
    const done = ids.filter((id) => completed.has(id)).length
    return { done, total: ids.length }
  }

  const section = SECTIONS[active]
  const ActiveSection = section.component

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Encabezado */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-3">
          <GraduationCap size={24} className="shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-black tracking-wide sm:text-base">
              Máquinas Sincrónicas · Capítulo 5
            </h1>
            <p className="hidden text-[11px] text-zinc-500 sm:block">
              Documento de estudio interactivo · basado en Fitzgerald–Kingsley–Umans, <em>Máquinas Eléctricas</em>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-zinc-800 sm:w-40">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-10 text-right font-mono text-xs font-bold text-emerald-300">
              {percent}%
            </span>
            {completed.size > 0 && (
              <button
                type="button"
                onClick={reset}
                title="Reiniciar progreso"
                className="text-zinc-600 transition-colors hover:text-zinc-300"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Barra de pestañas: una por sección, con progreso individual */}
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-0 pt-2">
          {SECTIONS.map((s, i) => {
            const { done, total } = sectionProgress(s.num)
            const isActive = i === active
            const complete = done === total
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActive(i)}
                className={`flex shrink-0 items-center gap-2 rounded-t-lg border-x border-t px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'border-zinc-700 bg-zinc-900 text-emerald-300'
                    : 'border-transparent bg-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                    complete
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isActive
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {complete ? <Check size={11} /> : s.num}
                </span>
                <span className="hidden sm:inline">{s.short}</span>
                <span
                  className={`font-mono text-[10px] ${complete ? 'text-emerald-400' : 'text-zinc-600'}`}
                >
                  {done}/{total}
                </span>
              </button>
            )
          })}
        </nav>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        {/* Índice lateral de la sección activa */}
        <aside className="sticky top-28 hidden h-fit w-64 shrink-0 lg:block">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <BookOpenText size={13} />
            En esta sección
          </p>
          <div className="rounded-xl border border-emerald-500/30 bg-zinc-900/50 p-3">
            <p className="text-xs font-bold text-zinc-200">
              <span className="mr-1.5 text-emerald-400">{section.num}.</span>
              {section.title}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {section.items.map((it) => (
                <li key={it} className="text-[11px] leading-snug text-zinc-500">
                  · {it}
                </li>
              ))}
            </ul>
          </div>

          <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Todas las secciones
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((s, i) => {
              const { done, total } = sectionProgress(s.num)
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition-colors ${
                    i === active
                      ? 'border-emerald-500/40 bg-emerald-500/5 text-zinc-200'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <span className="font-bold text-emerald-400">{s.num}</span>
                  <span className="flex-1 truncate">{s.short}</span>
                  <span className={`font-mono text-[10px] ${done === total ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {done}/{total}
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 text-[11px] leading-relaxed text-zinc-400">
            <p className="mb-1 font-bold text-violet-300">Método de uso (Feynman)</p>
            <ol className="list-decimal space-y-0.5 pl-4">
              <li>Lee «la idea en simple».</li>
              <li>PREDICE en cada chequeo antes de tocar nada.</li>
              <li>Compruébalo en el laboratorio.</li>
              <li>Resuelve el problema en papel; revela pasos solo para comparar.</li>
            </ol>
          </div>
        </aside>

        {/* Cuerpo: solo la sección activa */}
        <main className="min-w-0 flex-1">
          {active === 0 && (
            <div className="mb-10 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <Zap size={13} />
                Cómo absorber este capítulo
              </p>
              <p className="text-sm leading-relaxed text-zinc-300">
                Este documento no se puede «leer»: se <strong>trabaja</strong>. Cada concepto llega en
                tres capas — idea simple, analogía, formalización — y luego te obliga a{' '}
                <strong>predecir</strong> antes de mostrarte la respuesta. Los laboratorios ejecutan la
                física real (las mismas ecuaciones del libro, resueltas en vivo), y los problemas se
                revelan paso a paso con el <em>porqué</em> antes del <em>cómo</em>. Tu progreso (
                <span className="font-mono text-emerald-300">{percent}%</span>) solo avanza cuando
                superas predicciones y problemas — no cuando haces scroll. Navega con las pestañas de
                arriba: cada una es un tema autocontenido.
              </p>
            </div>
          )}

          <ActiveSection />

          {/* Navegación anterior / siguiente */}
          <div className="mt-10 flex items-stretch gap-3 border-t border-zinc-800 pt-6">
            {active > 0 ? (
              <button
                type="button"
                onClick={() => setActive(active - 1)}
                className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-colors hover:border-emerald-500/40"
              >
                <ChevronLeft size={18} className="shrink-0 text-emerald-400" />
                <span>
                  <span className="block text-[10px] uppercase tracking-wide text-zinc-500">Anterior</span>
                  <span className="block text-xs font-semibold text-zinc-200">
                    {SECTIONS[active - 1].num}. {SECTIONS[active - 1].title}
                  </span>
                </span>
              </button>
            ) : (
              <span className="flex-1" />
            )}
            {active < SECTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => setActive(active + 1)}
                className="flex flex-1 items-center justify-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-right transition-colors hover:border-emerald-500/40"
              >
                <span>
                  <span className="block text-[10px] uppercase tracking-wide text-zinc-500">Siguiente</span>
                  <span className="block text-xs font-semibold text-zinc-200">
                    {SECTIONS[active + 1].num}. {SECTIONS[active + 1].title}
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-emerald-400" />
              </button>
            ) : (
              <span className="flex flex-1 items-center justify-end rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs font-semibold text-emerald-300">
                Fin del capítulo — ¡revisa tu progreso en las pestañas! 🎓
              </span>
            )}
          </div>

          <footer className="mt-10 border-t border-zinc-800 pt-6 pb-10 text-center text-[11px] leading-relaxed text-zinc-600">
            Documento de estudio interactivo · Capítulo 5, <em>Máquinas Eléctricas</em> (Fitzgerald,
            Kingsley &amp; Umans) · Los valores numéricos de los problemas se calculan en vivo con el
            mismo motor de los laboratorios.
            <br />
            Con esto queda cubierto el núcleo del Capítulo 5. Posibles extensiones: pérdidas y
            rendimiento, y el puente hacia los transitorios (simulador SyncLab).
          </footer>
        </main>
      </div>
    </div>
  )
}
