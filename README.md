# Máquinas Sincrónicas — Suite Didáctica

Este repositorio contiene dos aplicaciones React independientes:

| App | Carpeta | Qué es |
|---|---|---|
| **SyncLab** | `/` (raíz) | Simulador de transitorios (cortocircuito, rechazo de carga, escalón de torque) |
| **Estudio Cap. 5** | `/study-ch5` | Documento de estudio interactivo del Capítulo 5 de Fitzgerald–Kingsley–Umans (método Feynman: predicción → laboratorio → problema resuelto), con progreso persistente |

Cada una se ejecuta por separado con `npm install && npm run dev` dentro de su carpeta.

---

# SyncLab — Simulador de Transitorios de la Máquina Sincrónica

Simulador didáctico e interactivo del **comportamiento en estado transitorio de un
generador sincrónico** de polos salientes conectado a barra infinita. SPA construida
con **React 19 + Vite + TypeScript**, **Tailwind CSS 4**, **Recharts** y un lienzo
**Canvas 2D** para la física inmersiva.

## Ejecución

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción
```

## Arquitectura

```
src/
├── engine/                  # Núcleo de simulación (lógica pura, sin UI)
│   ├── types.ts             # Tipado estricto del dominio (pu, rad, s)
│   ├── defaults.ts          # Parámetros típicos de un hidrogenerador
│   └── MathEngine.ts        # RK4, áreas iguales, t_cr, corrientes de falla
└── components/
    ├── Simulator.tsx        # Dashboard: pestañas, reloj de reproducción (rAF)
    ├── ControlPanel.tsx     # Inputs con tooltips didácticos
    ├── VectorCanvas.tsx     # Visión física: estator, rotor, Bs, Br y δ
    ├── PowerAngleChart.tsx  # Curva P-δ + criterio de áreas iguales
    ├── SwingChart.tsx       # δ(t) y Δω(t)
    ├── CurrentsChart.tsx    # ia, ib, ic con envolvente y offset DC
    ├── EngineeringReport.tsx# Diagnóstico de estabilidad y t_cr
    ├── PlaybackControls.tsx # Play/pausa, cámara lenta, scrubbing temporal
    └── Tooltip.tsx
```

## Modelo físico-matemático

El motor (`MathEngine.ts`) integra con **Runge-Kutta de 4to orden** (Δt = 5 ms,
t ∈ [0, 10] s):

- **Ecuación de oscilación:** `(2H/ωs)·d²δ/dt² = Pm − Pe − D·Δω/ωs`
- **Potencia eléctrica transitoria (con saliencia):**
  `Pe = (E'q·Vt/X'd)·sin δ + (Vt²/2)·(1/Xq − 1/X'd)·sin 2δ`
- **Envolvente de la corriente de cortocircuito:**
  `I(t) = (I″−I′)·e^(−t/T″d) + (I′−Iss)·e^(−t/T′d) + Iss`, con offset DC por fase
  que decae con `Ta` (asimetría) y continuidad garantizada en el instante de falla.
- **Tiempo crítico de despeje:** bisección sobre el integrador RK4 (respeta
  saliencia y amortiguamiento).
- **Criterio de áreas iguales:** integración numérica de las curvas reales
  (A1, A2,max, δcl, δcr, δu).

## Eventos simulables

| Evento | Modelo |
|---|---|
| Cortocircuito trifásico en bornes | `Pe = 0` durante la falla; despeje en `t_clearing` |
| Pérdida de carga | Apertura del interruptor: `Pe = 0` permanente → sobrevelocidad |
| Escalón de torque mecánico | `Pm → Pm + ΔPm`; oscilación hacia el nuevo equilibrio |

## Código de colores

- **Esmeralda** — operación estable / áreas de frenado
- **Ámbar** — magnitudes transitorias / campo del rotor
- **Rojo** — falla activa / pérdida de sincronismo / área de aceleración
