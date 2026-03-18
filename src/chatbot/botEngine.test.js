/**
 * botEngine.test.js
 * Pruebas unitarias del motor de estados del chatbot.
 *
 * Estrategia: se usa un mock del store para aislar el botEngine de
 * la capa de datos. Se verifican las transiciones de estado y los
 * mensajes devueltos por la función process().
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { process, getWelcomeMessages } from './botEngine.js'
import { STATES } from './states.js'

// ── Mock del store ────────────────────────────────────────────────────────────

function createMockStore(overrides = {}) {
    return {
        getPatients: vi.fn(() => []),
        findPatient: vi.fn(() => undefined),
        findDoctor: vi.fn(() => undefined),
        getOrCreatePatient: vi.fn((name) => ({ id: 'p_test', name })),
        getRecordsByPatient: vi.fn(() => []),
        addRecord: vi.fn((patientId, vitals) => ({ id: 'r_test', patientId, ...vitals })),
        deleteRecord: vi.fn(() => true),
        addObservation: vi.fn(() => true),
        ...overrides,
    }
}

const mockPatient = { id: 'p_001', name: 'Juan Pérez' }
const mockDoctor  = { id: 'doc1', name: 'Dr. García', password: '1234' }

// ── getWelcomeMessages ────────────────────────────────────────────────────────

describe('getWelcomeMessages', () => {
    it('devuelve al menos dos mensajes de bienvenida', () => {
        const msgs = getWelcomeMessages()
        expect(msgs.length).toBeGreaterThanOrEqual(2)
    })

    it('los mensajes son de tipo bot', () => {
        const msgs = getWelcomeMessages()
        msgs.forEach(m => expect(m.type).toBe('bot'))
    })
})

// ── WELCOME ───────────────────────────────────────────────────────────────────

describe('WELCOME', () => {
    const store = createMockStore()

    it('opción 1 → pasa a PATIENT_NAME', () => {
        const { nextState } = process('1', STATES.WELCOME, {}, store)
        expect(nextState).toBe(STATES.PATIENT_NAME)
    })

    it('opción 2 → pasa a DOCTOR_NAME', () => {
        const { nextState } = process('2', STATES.WELCOME, {}, store)
        expect(nextState).toBe(STATES.DOCTOR_NAME)
    })

    it('opción inválida → permanece en WELCOME con mensaje de error', () => {
        const { nextState, messages } = process('9', STATES.WELCOME, {}, store)
        expect(nextState).toBe(STATES.WELCOME)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })
})

// ── PATIENT_NAME ──────────────────────────────────────────────────────────────

describe('PATIENT_NAME', () => {
    it('nombre válido → pasa a PATIENT_MENU con mensaje de bienvenida', () => {
        const store = createMockStore({
            getOrCreatePatient: vi.fn(() => mockPatient),
        })
        const { nextState, messages, context } = process('Juan Pérez', STATES.PATIENT_NAME, {}, store)
        expect(nextState).toBe(STATES.PATIENT_MENU)
        expect(context.currentUser).toEqual(mockPatient)
        expect(context.userType).toBe('patient')
        expect(messages.some(m => m.type === 'bot-success')).toBe(true)
    })

    it('nombre vacío → permanece en PATIENT_NAME con error', () => {
        const store = createMockStore()
        const { nextState, messages } = process('', STATES.PATIENT_NAME, {}, store)
        expect(nextState).toBe(STATES.PATIENT_NAME)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })
})

// ── DOCTOR_NAME / DOCTOR_PASSWORD ─────────────────────────────────────────────

describe('DOCTOR_NAME', () => {
    it('nombre no vacío → pasa a DOCTOR_PASSWORD guardando nombre en contexto', () => {
        const store = createMockStore()
        const { nextState, context } = process('Dr. García', STATES.DOCTOR_NAME, {}, store)
        expect(nextState).toBe(STATES.DOCTOR_PASSWORD)
        expect(context.doctorNameAttempt).toBe('Dr. García')
    })

    it('nombre vacío → permanece en DOCTOR_NAME con error', () => {
        const store = createMockStore()
        const { nextState, messages } = process('   ', STATES.DOCTOR_NAME, {}, store)
        expect(nextState).toBe(STATES.DOCTOR_NAME)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })
})

describe('DOCTOR_PASSWORD', () => {
    it('credenciales correctas → pasa a DOCTOR_MENU con mensaje de bienvenida', () => {
        const store = createMockStore({ findDoctor: vi.fn(() => mockDoctor) })
        const ctx = { doctorNameAttempt: 'Dr. García' }
        const { nextState, messages, context } = process('1234', STATES.DOCTOR_PASSWORD, ctx, store)
        expect(nextState).toBe(STATES.DOCTOR_MENU)
        expect(context.currentUser).toEqual(mockDoctor)
        expect(context.userType).toBe('doctor')
        expect(messages.some(m => m.type === 'bot-success')).toBe(true)
    })

    it('credenciales incorrectas → regresa a DOCTOR_NAME con error', () => {
        const store = createMockStore({ findDoctor: vi.fn(() => undefined) })
        const ctx = { doctorNameAttempt: 'Dr. García' }
        const { nextState, messages } = process('wrong', STATES.DOCTOR_PASSWORD, ctx, store)
        expect(nextState).toBe(STATES.DOCTOR_NAME)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })
})

// ── PATIENT_MENU ──────────────────────────────────────────────────────────────

describe('PATIENT_MENU', () => {
    const ctx = { currentUser: mockPatient }

    it('opción 1 → inicia registro de signos (REG_SYSTOLIC)', () => {
        const { nextState } = process('1', STATES.PATIENT_MENU, ctx, createMockStore())
        expect(nextState).toBe(STATES.REG_SYSTOLIC)
    })

    it('opción 4 → cierra sesión (WELCOME)', () => {
        const { nextState } = process('4', STATES.PATIENT_MENU, ctx, createMockStore())
        expect(nextState).toBe(STATES.WELCOME)
    })

    it('opción inválida → permanece en PATIENT_MENU con error', () => {
        const { nextState, messages } = process('9', STATES.PATIENT_MENU, ctx, createMockStore())
        expect(nextState).toBe(STATES.PATIENT_MENU)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })
})

// ── Registro de signos vitales ────────────────────────────────────────────────

describe('REG_SYSTOLIC', () => {
    it('valor válido → pasa a REG_DIASTOLIC', () => {
        const { nextState } = process('120', STATES.REG_SYSTOLIC, { vitals: {} }, createMockStore())
        expect(nextState).toBe(STATES.REG_DIASTOLIC)
    })

    it('valor fuera de rango → permanece en REG_SYSTOLIC con error', () => {
        const { nextState, messages } = process('300', STATES.REG_SYSTOLIC, { vitals: {} }, createMockStore())
        expect(nextState).toBe(STATES.REG_SYSTOLIC)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })

    it('texto no numérico → permanece en REG_SYSTOLIC con error', () => {
        const { nextState, messages } = process('abc', STATES.REG_SYSTOLIC, { vitals: {} }, createMockStore())
        expect(nextState).toBe(STATES.REG_SYSTOLIC)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })

    it('presión muy alta genera alerta de crisis', () => {
        const { messages } = process('185', STATES.REG_SYSTOLIC, { vitals: {} }, createMockStore())
        expect(messages.some(m => m.type === 'bot-alert')).toBe(true)
    })
})

describe('REG_DIASTOLIC', () => {
    it('valor válido menor que sistólica → pasa a REG_HEART_RATE', () => {
        const ctx = { vitals: { systolic: 120 } }
        const { nextState } = process('80', STATES.REG_DIASTOLIC, ctx, createMockStore())
        expect(nextState).toBe(STATES.REG_HEART_RATE)
    })

    it('diastólica >= sistólica → error, permanece en REG_DIASTOLIC', () => {
        const ctx = { vitals: { systolic: 120 } }
        const { nextState, messages } = process('120', STATES.REG_DIASTOLIC, ctx, createMockStore())
        expect(nextState).toBe(STATES.REG_DIASTOLIC)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })
})

describe('REG_HEART_RATE', () => {
    it('valor válido → pasa a REG_TEMP_ASK', () => {
        const ctx = { vitals: { systolic: 120, diastolic: 80 } }
        const { nextState } = process('72', STATES.REG_HEART_RATE, ctx, createMockStore())
        expect(nextState).toBe(STATES.REG_TEMP_ASK)
    })

    it('frecuencia alta (taquicardia) genera alerta', () => {
        const ctx = { vitals: { systolic: 120, diastolic: 80 } }
        const { messages } = process('110', STATES.REG_HEART_RATE, ctx, createMockStore())
        expect(messages.some(m => m.type === 'bot-alert')).toBe(true)
    })
})

describe('REG_TEMP_ASK', () => {
    it('respuesta "s" → pasa a REG_TEMP', () => {
        const { nextState } = process('s', STATES.REG_TEMP_ASK, { vitals: {} }, createMockStore())
        expect(nextState).toBe(STATES.REG_TEMP)
    })

    it('respuesta "n" → pasa a REG_OXSAT_ASK', () => {
        const { nextState } = process('n', STATES.REG_TEMP_ASK, { vitals: {} }, createMockStore())
        expect(nextState).toBe(STATES.REG_OXSAT_ASK)
    })
})

describe('REG_OXSAT_ASK', () => {
    it('respuesta "n" → guarda el registro y va a PATIENT_MENU', () => {
        const ctx = {
            currentUser: mockPatient,
            vitals: { systolic: 120, diastolic: 80, heartRate: 72 },
        }
        const store = createMockStore()
        const { nextState } = process('n', STATES.REG_OXSAT_ASK, ctx, store)
        expect(nextState).toBe(STATES.PATIENT_MENU)
        expect(store.addRecord).toHaveBeenCalledOnce()
    })

    it('respuesta "s" → pasa a REG_OXSAT', () => {
        const ctx = {
            currentUser: mockPatient,
            vitals: { systolic: 120, diastolic: 80, heartRate: 72 },
        }
        const { nextState } = process('s', STATES.REG_OXSAT_ASK, ctx, createMockStore())
        expect(nextState).toBe(STATES.REG_OXSAT)
    })
})

describe('REG_OXSAT', () => {
    it('valor válido → guarda el registro y va a PATIENT_MENU', () => {
        const ctx = {
            currentUser: mockPatient,
            vitals: { systolic: 120, diastolic: 80, heartRate: 72 },
        }
        const store = createMockStore()
        const { nextState } = process('97', STATES.REG_OXSAT, ctx, store)
        expect(nextState).toBe(STATES.PATIENT_MENU)
        expect(store.addRecord).toHaveBeenCalledOnce()
    })

    it('saturación crítica genera alerta antes de guardar', () => {
        const ctx = {
            currentUser: mockPatient,
            vitals: { systolic: 120, diastolic: 80, heartRate: 72 },
        }
        const { messages } = process('85', STATES.REG_OXSAT, ctx, createMockStore())
        expect(messages.some(m => m.type === 'bot-alert')).toBe(true)
    })
})

// ── Ver y eliminar registros (paciente) ───────────────────────────────────────

describe('PATIENT_MENU opción 2 - ver registros', () => {
    it('sin registros → permanece en PATIENT_MENU con mensaje informativo', () => {
        const store = createMockStore({ getRecordsByPatient: vi.fn(() => []) })
        const { nextState } = process('2', STATES.PATIENT_MENU, { currentUser: mockPatient }, store)
        expect(nextState).toBe(STATES.PATIENT_MENU)
    })

    it('con registros → pasa a VIEW_RECORDS', () => {
        const store = createMockStore({
            getRecordsByPatient: vi.fn(() => [{
                id: 'r1', patientId: 'p_001', systolic: 120, diastolic: 80,
                heartRate: 72, temperature: null, oxygenSat: null,
                observation: null, dateTime: '2025-01-01T10:00:00.000Z',
            }]),
        })
        const { nextState } = process('2', STATES.PATIENT_MENU, { currentUser: mockPatient }, store)
        expect(nextState).toBe(STATES.VIEW_RECORDS)
    })
})

describe('PATIENT_MENU opción 3 - eliminar registro', () => {
    it('sin registros → permanece en PATIENT_MENU', () => {
        const store = createMockStore({ getRecordsByPatient: vi.fn(() => []) })
        const { nextState } = process('3', STATES.PATIENT_MENU, { currentUser: mockPatient }, store)
        expect(nextState).toBe(STATES.PATIENT_MENU)
    })
})

describe('DELETE_SELECT', () => {
    const mockRecord = {
        id: 'r1', patientId: 'p_001', systolic: 120, diastolic: 80,
        heartRate: 72, temperature: null, oxygenSat: null,
        observation: null, dateTime: '2025-01-01T10:00:00.000Z',
    }

    it('índice válido → elimina registro y va a PATIENT_MENU', () => {
        const store = createMockStore({ getRecordsByPatient: vi.fn(() => [mockRecord]) })
        const ctx = { currentUser: mockPatient }
        const { nextState, messages } = process('1', STATES.DELETE_SELECT, ctx, store)
        expect(nextState).toBe(STATES.PATIENT_MENU)
        expect(messages.some(m => m.type === 'bot-success')).toBe(true)
        expect(store.deleteRecord).toHaveBeenCalledWith('r1')
    })

    it('"cancelar" → va a PATIENT_MENU sin eliminar', () => {
        const store = createMockStore({ getRecordsByPatient: vi.fn(() => [mockRecord]) })
        const ctx = { currentUser: mockPatient }
        const { nextState } = process('cancelar', STATES.DELETE_SELECT, ctx, store)
        expect(nextState).toBe(STATES.PATIENT_MENU)
        expect(store.deleteRecord).not.toHaveBeenCalled()
    })

    it('índice inválido → permanece en DELETE_SELECT con error', () => {
        const store = createMockStore({ getRecordsByPatient: vi.fn(() => [mockRecord]) })
        const { nextState, messages } = process('99', STATES.DELETE_SELECT, { currentUser: mockPatient }, store)
        expect(nextState).toBe(STATES.DELETE_SELECT)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })
})

// ── Menú médico ───────────────────────────────────────────────────────────────

describe('DOCTOR_MENU', () => {
    const ctx = { currentUser: mockDoctor, userType: 'doctor' }

    it('opción 4 → cierra sesión (WELCOME)', () => {
        const { nextState } = process('4', STATES.DOCTOR_MENU, ctx, createMockStore())
        expect(nextState).toBe(STATES.WELCOME)
    })

    it('opción inválida → permanece en DOCTOR_MENU con error', () => {
        const { nextState, messages } = process('0', STATES.DOCTOR_MENU, ctx, createMockStore())
        expect(nextState).toBe(STATES.DOCTOR_MENU)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })

    it('opción 1 sin pacientes → permanece en DOCTOR_MENU con info', () => {
        const { nextState } = process('1', STATES.DOCTOR_MENU, ctx, createMockStore())
        expect(nextState).toBe(STATES.DOCTOR_MENU)
    })

    it('opción 1 con pacientes → permanece en DOCTOR_MENU mostrando lista', () => {
        const store = createMockStore({
            getPatients: vi.fn(() => [mockPatient]),
        })
        const { nextState, messages } = process('1', STATES.DOCTOR_MENU, ctx, store)
        expect(nextState).toBe(STATES.DOCTOR_MENU)
        expect(messages.some(m => m.text.includes('Juan Pérez'))).toBe(true)
    })
})

// ── Estado desconocido ────────────────────────────────────────────────────────

describe('Estado desconocido', () => {
    it('retorna al estado WELCOME con error', () => {
        const { nextState, messages } = process('x', 'ESTADO_INVALIDO', {}, createMockStore())
        expect(nextState).toBe(STATES.WELCOME)
        expect(messages.some(m => m.type === 'bot-error')).toBe(true)
    })
})
