import type { EventConfig, MachineParams, OperatingPoint, SimConfig } from './types'

/** Generador típico de polos salientes con turbina hidráulica (valores en pu, base máquina). */
export const DEFAULT_MACHINE: MachineParams = {
  Xd: 1.81,
  Xq: 1.76,
  Xd1: 0.3,
  Xd2: 0.23,
  Xq1: 0.65,
  Xq2: 0.25,
  H: 3.5,
  D: 2.0,
  Td1: 1.0,
  Td2: 0.03,
  Ta: 0.2,
  f: 60,
}

export const DEFAULT_OPERATING_POINT: OperatingPoint = {
  P0: 0.8,
  Q0: 0.4,
  Vt: 1.0,
}

export const DEFAULT_EVENT: EventConfig = {
  type: 'short-circuit',
  tFault: 0.5,
  tClearing: 0.15,
  torqueStep: 0.3,
}

export const DEFAULT_SIM_CONFIG: SimConfig = {
  machine: DEFAULT_MACHINE,
  op: DEFAULT_OPERATING_POINT,
  event: DEFAULT_EVENT,
  tEnd: 10,
  dt: 0.005,
}
