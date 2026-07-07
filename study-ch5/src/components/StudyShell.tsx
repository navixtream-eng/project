import { BookOpenText, GraduationCap, RotateCcw, Zap } from 'lucide-react'
import { useProgress } from './ProgressContext'
import Section1 from '../sections/Section1'
import Section2 from '../sections/Section2'
import Section3 from '../sections/Section3'

const TOC = [
  {
    href: '#seccion-1',
    num: '1',
    title: 'Campo giratorio y velocidad síncrona',
    items: ['El truco del imán giratorio', 'nₛ = 120f/p', 'Problema 1: central hidroeléctrica'],
  },
  {
    href: '#seccion-2',
    num: '2',
    title: 'FEM interna y diagrama fasorial',
    items: ['Eaf = Vt + jXs·Ia', 'La curva V de excitación', 'Problemas 2 y 3: sobre/subexcitado'],
  },
  {
    href: '#seccion-3',
    num: '3',
    title: 'Potencia-ángulo y barra infinita',
    items: ['P = Eaf·Vt·sen δ / Xs', 'Los dos mandos y el par sincronizante', 'Problemas 4 y 5: margen y pérdida de paso'],
  },
]

/**
 * Cascarón del documento de estudio: índice lateral con progreso real
 * (chequeos Feynman + problemas superados) y el cuerpo de las secciones.
 */
export default function StudyShell() {
  const { percent, completed, reset } = useProgress()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Encabezado */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
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
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        {/* Índice lateral */}
        <aside className="sticky top-20 hidden h-fit w-64 shrink-0 lg:block">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <BookOpenText size={13} />
            Contenido
          </p>
          <nav className="space-y-4">
            {TOC.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-emerald-500/40"
              >
                <p className="text-xs font-bold text-zinc-200">
                  <span className="mr-1.5 text-emerald-400">{s.num}.</span>
                  {s.title}
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {s.items.map((it) => (
                    <li key={it} className="text-[11px] leading-snug text-zinc-500">
                      · {it}
                    </li>
                  ))}
                </ul>
              </a>
            ))}
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

        {/* Cuerpo */}
        <main className="min-w-0 flex-1">
          <div className="mb-10 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <Zap size={13} />
              Cómo absorber este capítulo
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">
              Este documento no se puede «leer»: se <strong>trabaja</strong>. Cada concepto llega en tres
              capas — idea simple, analogía, formalización — y luego te obliga a{' '}
              <strong>predecir</strong> antes de mostrarte la respuesta. Los laboratorios ejecutan la
              física real (las mismas ecuaciones del libro, resueltas en vivo), y los problemas se
              revelan paso a paso con el <em>porqué</em> antes del <em>cómo</em>. Tu progreso (
              <span className="font-mono text-emerald-300">{percent}%</span>) solo avanza cuando
              superas predicciones y problemas — no cuando haces scroll.
            </p>
          </div>

          <Section1 />
          <div className="my-12 border-t border-zinc-800" />
          <Section2 />
          <div className="my-12 border-t border-zinc-800" />
          <Section3 />

          <footer className="mt-16 border-t border-zinc-800 pt-6 pb-10 text-center text-[11px] leading-relaxed text-zinc-600">
            Documento de estudio interactivo · Capítulo 5, <em>Máquinas Eléctricas</em> (Fitzgerald,
            Kingsley &amp; Umans) · Los valores numéricos de los problemas se calculan en vivo con el
            mismo motor de los laboratorios.
            <br />
            Próximas entregas: curvas de capacidad, operación como motor sincrónico y efectos de
            saturación.
          </footer>
        </main>
      </div>
    </div>
  )
}
