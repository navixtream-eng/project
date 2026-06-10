import { Pause, Play, RotateCcw, Turtle } from 'lucide-react'

interface PlaybackControlsProps {
  time: number
  tEnd: number
  playing: boolean
  speed: number
  disabled: boolean
  onPlayPause: () => void
  onReset: () => void
  onSpeedChange: (s: number) => void
  onSeek: (t: number) => void
}

const SPEEDS = [0.1, 0.25, 0.5, 1, 2]

/**
 * Transporte de la reproducción: play/pausa, reinicio, cámara lenta y un
 * slider para inspeccionar cualquier instante exacto del transitorio.
 */
export default function PlaybackControls({
  time,
  tEnd,
  playing,
  speed,
  disabled,
  onPlayPause,
  onReset,
  onSpeedChange,
  onSeek,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2.5">
      <button
        type="button"
        onClick={onPlayPause}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
        aria-label={playing ? 'Pausar' : 'Reproducir'}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Reiniciar"
      >
        <RotateCcw size={15} />
      </button>

      <div className="flex items-center gap-1.5" title="Velocidad de reproducción (cámara lenta)">
        <Turtle size={15} className="text-zinc-500" />
        {SPEEDS.map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => onSpeedChange(sp)}
            disabled={disabled}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40 ${
              speed === sp
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {sp}×
          </button>
        ))}
      </div>

      <div className="flex min-w-48 flex-1 items-center gap-3">
        <input
          type="range"
          className="flex-1"
          min={0}
          max={tEnd}
          step={0.01}
          value={time}
          disabled={disabled}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Posición temporal"
        />
        <span className="w-24 text-right font-mono text-xs text-zinc-400">
          {time.toFixed(2)} / {tEnd.toFixed(0)} s
        </span>
      </div>
    </div>
  )
}
