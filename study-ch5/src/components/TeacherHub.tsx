import { useMemo, useRef, useState } from 'react'
import {
  BookOpenCheck,
  Download,
  FileText,
  GraduationCap,
  ListChecks,
  Map as MapIcon,
  Printer,
  RefreshCw,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react'
import { ALL_CHECK_IDS, useProgress } from './ProgressContext'
import { CHAPTERS, SECTIONS } from './StudyShell'
import {
  type GeneratedProblem,
  PROBLEM_TEMPLATES,
  type ProblemTemplate,
  TEACHING_NOTES,
} from '../lib/teacherData'

type Tab = 'progreso' | 'mapa' | 'guia' | 'hojas'

const TABS: { id: Tab; label: string; icon: typeof MapIcon }[] = [
  { id: 'mapa', label: 'Mapa del curso', icon: MapIcon },
  { id: 'guia', label: 'Guía docente', icon: BookOpenCheck },
  { id: 'hojas', label: 'Hojas de problemas', icon: FileText },
  { id: 'progreso', label: 'Progreso', icon: ListChecks },
]

function secProgress(prefix: string, completed: Set<string>) {
  const ids = ALL_CHECK_IDS.filter((id) => id.startsWith(prefix))
  return { done: ids.filter((id) => completed.has(id)).length, total: ids.length }
}

// ---- Impresión / PDF robusta: se construye un documento HTML autónomo y se
//      abre en una PESTAÑA NUEVA (contexto de nivel superior donde la impresión
//      del navegador sí funciona, a diferencia del iframe con sandbox del
//      Artifact). Botón de descarga como respaldo si las ventanas emergentes
//      están bloqueadas.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const PRINT_CSS = `
  *{box-sizing:border-box}
  body{font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:22px;font-size:12px;line-height:1.5}
  h1{font-size:18px;margin:0 0 2px}
  .sub{color:#666;font-size:11px;margin:0 0 16px}
  h2{font-size:13px;color:#a21caf;border-bottom:1px solid #ddd;padding-bottom:3px;margin:18px 0 8px}
  .item{border:1px solid #cbd5e1;border-radius:6px;padding:9px 12px;margin:8px 0;page-break-inside:avoid;break-inside:avoid}
  .tag{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#a21caf;font-weight:700;margin:0 0 4px}
  .ttl{font-weight:700;margin:0 0 3px}
  .ans{border:1px solid #86efac;background:#f0fdf4;border-radius:5px;padding:6px 8px;margin-top:8px;font-size:11px}
  ul{margin:4px 0;padding-left:18px}li{margin:2px 0}
  .meta{color:#888;font-size:10px}
  .row{margin:2px 0}
  .obj{color:#166534}.err{color:#b91c1c}.demo{color:#1d4ed8}.disc{color:#b45309}
  .printbar{position:sticky;top:0;z-index:9;display:flex;gap:10px;align-items:center;justify-content:center;background:#fde68a;color:#111;padding:9px 14px;border-radius:8px;font-weight:600;margin:-8px 0 16px}
  .printbar button{cursor:pointer;border:0;border-radius:6px;background:#7c3aed;color:#fff;font:600 12px system-ui;padding:6px 12px}
  @page{margin:14mm}
  @media print{.printbar{display:none}}
`

const wrapDoc = (title: string, body: string) =>
  `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${PRINT_CSS}</style></head><body>${body}</body></html>`

/**
 * Abre el documento en una pestaña nueva con una barra «Imprimir / PDF» y un
 * intento de impresión automática. En una pestaña de nivel superior el diálogo
 * de impresión del navegador funciona aunque el Artifact esté en un iframe con
 * sandbox. Si las emergentes están bloqueadas, descarga el archivo.
 */
function printDoc(html: string, filename: string) {
  const bar =
    '<div class="printbar">Documento listo — <button onclick="window.print()">Imprimir / Guardar como PDF</button> o usa Ctrl/Cmd + P</div>' +
    '<script>window.addEventListener("load",function(){setTimeout(function(){try{window.focus();window.print()}catch(e){}},400)})</script>'
  const doc = html.replace('<body>', '<body>' + bar)
  const blob = new Blob([doc], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const w = window.open(url, '_blank')
  if (!w) {
    // Emergente bloqueada: descargar como respaldo garantizado
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120000)
}

function downloadDoc(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildMapHtml(): string {
  let body = `<h1>Máquinas Eléctricas — Mapa del curso</h1><p class="sub">${SECTIONS.length} secciones · ${CHAPTERS.length} capítulos · basado en Fitzgerald-Kingsley-Umans</p>`
  for (const ch of CHAPTERS) {
    body += `<h2>Capítulo ${ch.id} · ${esc(ch.sub)}</h2>`
    for (const s of SECTIONS.filter((x) => x.chapter === ch.id)) {
      const note = TEACHING_NOTES[s.prefix]
      body += `<div class="item"><p class="ttl">${ch.id}.${s.num} · ${esc(s.title)}</p>`
      if (note) body += `<ul>${note.objetivos.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>`
      body += `<p class="meta">Temas: ${esc(s.items.join(' · '))}</p></div>`
    }
  }
  return wrapDoc('Mapa del curso — Máquinas Eléctricas', body)
}

function buildGuideHtml(): string {
  let body = `<h1>Máquinas Eléctricas — Guía docente</h1><p class="sub">Notas de clase por sección: objetivo, error común, qué demostrar y una pregunta de discusión</p>`
  for (const s of SECTIONS) {
    const n = TEACHING_NOTES[s.prefix]
    if (!n) continue
    body += `<div class="item"><p class="ttl">${s.chapter}.${s.num} · ${esc(s.title)} <span class="meta">(~${n.minutos} min)</span></p>`
    body += `<p class="row"><b class="obj">Objetivos:</b> ${esc(n.objetivos.join('; '))}.</p>`
    body += `<p class="row"><b class="err">Error común:</b> ${esc(n.errorComun)}</p>`
    body += `<p class="row"><b class="demo">Demostrar:</b> ${esc(n.demo)}</p>`
    body += `<p class="row"><b class="disc">Discusión:</b> ${esc(n.discusion)}</p></div>`
  }
  return wrapDoc('Guía docente — Máquinas Eléctricas', body)
}

/** Barra de impresión: abre el diálogo de impresión (→ Guardar como PDF) o descarga el HTML. */
function PrintBar({ build, filename }: { build: () => string; filename: string }) {
  return (
    <div className="tw-no-print flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => printDoc(build(), filename)}
        title="Abre el documento en una pestaña nueva y lanza el diálogo de impresión (→ Guardar como PDF)"
        className="flex items-center gap-1.5 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20"
      >
        <Printer size={13} /> Imprimir / PDF
      </button>
      <button
        type="button"
        onClick={() => downloadDoc(build(), filename)}
        title="Descargar como HTML (ábrelo en tu navegador e imprime a PDF)"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-fuchsia-500/50"
      >
        <Download size={13} /> HTML
      </button>
    </div>
  )
}

export default function TeacherHub({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { completed, percent, exportProgress, importProgress, reset } = useProgress()
  const [tab, setTab] = useState<Tab>('mapa')
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Estado del generador de hojas
  const [selected, setSelected] = useState<Set<string>>(new Set(PROBLEM_TEMPLATES.map((t) => t.id)))
  const [perTemplate, setPerTemplate] = useState(1)
  const [withAnswers, setWithAnswers] = useState(true)
  const [sheet, setSheet] = useState<{ template: ProblemTemplate; problems: GeneratedProblem[] }[]>([])

  const chapterProgress = useMemo(() => {
    return CHAPTERS.map((ch) => {
      const defs = SECTIONS.filter((s) => s.chapter === ch.id)
      const agg = defs.reduce(
        (acc, d) => {
          const p = secProgress(d.prefix, completed)
          return { done: acc.done + p.done, total: acc.total + p.total }
        },
        { done: 0, total: 0 },
      )
      return { ...ch, ...agg }
    })
  }, [completed])

  if (!open) return null

  const downloadProgress = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'progreso-maquinas-electricas.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((txt) => {
      const n = importProgress(txt)
      setImportMsg(n === null ? '⚠ Archivo no válido' : `✓ ${n} hitos importados`)
    })
    e.target.value = ''
  }

  const generateSheet = () => {
    const out = PROBLEM_TEMPLATES.filter((t) => selected.has(t.id)).map((template) => ({
      template,
      problems: Array.from({ length: perTemplate }, () => template.generate()),
    }))
    setSheet(out)
  }

  const buildWorksheetHtml = () => {
    let n = 0
    let body = `<h1>Hoja de problemas — Máquinas Eléctricas</h1><p class="sub">Nombre: ______________________&nbsp;&nbsp;&nbsp;Fecha: ____________&nbsp;&nbsp;&nbsp;Grupo: __________</p>`
    for (const { template, problems } of sheet) {
      for (const prob of problems) {
        n += 1
        body += `<div class="item"><p class="tag">${n}. ${esc(template.title)} (Cap. ${template.chapter})</p><p>${esc(prob.statement)}</p>`
        if (withAnswers) body += `<div class="ans"><b>Clave:</b> ${esc(prob.answer)}</div>`
        body += `</div>`
      }
    }
    return wrapDoc('Hoja de problemas — Máquinas Eléctricas', body)
  }

  let counter = 0

  return (
    <div className="tw-modal-overlay fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="tw-modal flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-none border border-zinc-700 bg-zinc-950 shadow-2xl sm:h-[90vh] sm:rounded-2xl">
        {/* Encabezado */}
        <header className="tw-no-print flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
          <GraduationCap size={18} className="text-fuchsia-400" />
          <h2 className="text-sm font-black text-zinc-100">Panel docente</h2>
          <span className="hidden text-[11px] text-zinc-500 sm:inline">
            · guía de clase, mapa del curso y generador de problemas
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        {/* Pestañas */}
        <nav className="tw-no-print flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-800 px-3 pt-2">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-t-lg border-x border-t px-3 py-2 text-xs font-semibold ${
                  active
                    ? 'border-zinc-700 bg-zinc-900 text-fuchsia-300'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            )
          })}
        </nav>

        {/* Contenido */}
        <div className="tw-modal-body min-h-0 flex-1 overflow-y-auto bg-zinc-950 p-4">
          {/* ---- MAPA DEL CURSO ---- */}
          {tab === 'mapa' && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-400">
                  Alinea el documento a tu sílabo: {SECTIONS.length} secciones en {CHAPTERS.length}{' '}
                  capítulos, con objetivos de aprendizaje.
                </p>
                <PrintBar build={buildMapHtml} filename="mapa-curso.html" />
              </div>
              <div className="tw-print space-y-5">
                <h1 className="hidden text-lg font-black tw-only-print">
                  Máquinas Eléctricas — Mapa del curso
                </h1>
                {CHAPTERS.map((ch) => (
                  <section key={ch.id}>
                    <h3 className="mb-2 border-b border-zinc-800 pb-1 text-sm font-black text-fuchsia-300">
                      Capítulo {ch.id} · {ch.sub}
                    </h3>
                    <div className="space-y-2">
                      {SECTIONS.filter((s) => s.chapter === ch.id).map((s) => {
                        const note = TEACHING_NOTES[s.prefix]
                        return (
                          <div key={s.prefix} className="rounded-lg border border-zinc-800 p-2.5">
                            <p className="text-xs font-bold text-zinc-100">
                              {ch.id}.{s.num} · {s.title}
                            </p>
                            {note && (
                              <ul className="mt-1 list-disc pl-4 text-[11px] leading-relaxed text-zinc-400">
                                {note.objetivos.map((o) => (
                                  <li key={o}>{o}</li>
                                ))}
                              </ul>
                            )}
                            <p className="mt-1 text-[10px] text-zinc-600">
                              Temas: {s.items.join(' · ')}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          {/* ---- GUÍA DOCENTE ---- */}
          {tab === 'guia' && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-400">
                  Notas de clase por sección: objetivo, error común, qué demostrar y una pregunta de
                  discusión.
                </p>
                <PrintBar build={buildGuideHtml} filename="guia-docente.html" />
              </div>
              <div className="tw-print space-y-4">
                <h1 className="hidden text-lg font-black tw-only-print">
                  Máquinas Eléctricas — Guía docente
                </h1>
                {SECTIONS.map((s) => {
                  const note = TEACHING_NOTES[s.prefix]
                  if (!note) return null
                  return (
                    <div key={s.prefix} className="break-inside-avoid rounded-lg border border-zinc-800 p-3">
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <p className="text-xs font-black text-fuchsia-300">
                          {s.chapter}.{s.num} · {s.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-zinc-500">~{note.minutos} min</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-300">
                        <span className="font-semibold text-emerald-300">Objetivos: </span>
                        {note.objetivos.join('; ')}.
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                        <span className="font-semibold text-red-300">Error común: </span>
                        {note.errorComun}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                        <span className="font-semibold text-sky-300">Demostrar: </span>
                        {note.demo}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                        <span className="font-semibold text-amber-300">Discusión: </span>
                        {note.discusion}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ---- HOJAS DE PROBLEMAS ---- */}
          {tab === 'hojas' && (
            <div>
              <div className="tw-no-print mb-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <p className="mb-2 text-xs text-zinc-400">
                  Elige plantillas y cuántas variantes; los valores se generan al azar y las respuestas
                  las calcula el mismo motor de física del documento.
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {PROBLEM_TEMPLATES.map((t) => (
                    <label key={t.id} className="flex cursor-pointer items-center gap-2 text-[11px] text-zinc-300">
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={(e) => {
                          const next = new Set(selected)
                          if (e.target.checked) next.add(t.id)
                          else next.delete(t.id)
                          setSelected(next)
                        }}
                        className="h-3.5 w-3.5 accent-fuchsia-500"
                      />
                      <span className="rounded bg-zinc-800 px-1 font-mono text-[9px] text-fuchsia-300">
                        C{t.chapter}
                      </span>
                      {t.title}
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <label className="flex items-center gap-1.5">
                    Variantes por plantilla
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={perTemplate}
                      onChange={(e) => setPerTemplate(Math.max(1, Math.min(10, Number(e.target.value))))}
                      className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-zinc-100"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={withAnswers}
                      onChange={(e) => setWithAnswers(e.target.checked)}
                      className="h-3.5 w-3.5 accent-emerald-500"
                    />
                    Incluir clave de respuestas
                  </label>
                  <button
                    type="button"
                    onClick={generateSheet}
                    className="flex items-center gap-1.5 rounded-lg bg-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-fuchsia-500"
                  >
                    <RefreshCw size={13} /> {sheet.length ? 'Regenerar' : 'Generar hoja'}
                  </button>
                  {sheet.length > 0 && <PrintBar build={buildWorksheetHtml} filename="hoja-problemas.html" />}
                </div>
              </div>

              {sheet.length > 0 && (
                <div className="tw-print">
                  <h1 className="mb-1 text-base font-black text-zinc-100">
                    Hoja de problemas — Máquinas Eléctricas
                  </h1>
                  <p className="mb-4 text-[11px] text-zinc-500">
                    Nombre: ________________________   Fecha: ____________   Grupo: __________
                  </p>
                  <ol className="space-y-3">
                    {sheet.flatMap(({ template, problems }) =>
                      problems.map((prob) => {
                        counter += 1
                        return (
                          <li key={`${template.id}-${counter}`} className="break-inside-avoid rounded-lg border border-zinc-800 p-3">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-400">
                              {counter}. {template.title} <span className="text-zinc-600">(Cap. {template.chapter})</span>
                            </p>
                            <p className="text-xs leading-relaxed text-zinc-200">{prob.statement}</p>
                            {withAnswers && (
                              <p className="mt-2 rounded border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 text-[11px] leading-relaxed text-emerald-200">
                                <span className="font-semibold">Clave: </span>
                                {prob.answer}
                              </p>
                            )}
                          </li>
                        )
                      }),
                    )}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* ---- PROGRESO ---- */}
          {tab === 'progreso' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <p className="mb-2 text-xs text-zinc-400">
                  El progreso se guarda en ESTE navegador. Un estudiante puede{' '}
                  <strong className="text-zinc-200">exportar</strong> su avance a un archivo y
                  entregártelo; tú puedes <strong className="text-zinc-200">importarlo</strong> aquí
                  para revisarlo.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadProgress}
                    className="flex items-center gap-1.5 rounded-lg bg-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-fuchsia-500"
                  >
                    <Download size={13} /> Exportar progreso (.json)
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-fuchsia-500/50"
                  >
                    <Upload size={13} /> Importar progreso
                  </button>
                  <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImportFile} className="hidden" />
                  <button
                    type="button"
                    onClick={() => {
                      reset()
                      setImportMsg('Progreso reiniciado')
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-red-500/40 hover:text-red-300"
                  >
                    <RotateCcw size={13} /> Reiniciar
                  </button>
                  {importMsg && <span className="text-xs font-semibold text-emerald-300">{importMsg}</span>}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-300">Avance por capítulo</p>
                  <span className="font-mono text-xs font-bold text-emerald-300">{percent}% total</span>
                </div>
                <div className="space-y-1.5">
                  {chapterProgress.map((ch) => {
                    const pct = ch.total ? Math.round((ch.done / ch.total) * 100) : 0
                    return (
                      <div key={ch.id} className="flex items-center gap-2 text-xs">
                        <span className="w-32 shrink-0 truncate text-zinc-400">
                          Cap. {ch.id} · {ch.sub}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                          <div className="h-full rounded-full bg-fuchsia-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-12 shrink-0 text-right font-mono text-zinc-500">
                          {ch.done}/{ch.total}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
