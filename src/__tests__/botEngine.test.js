import { describe, it, expect, vi, beforeEach } from 'vitest'
import { process, getWelcomeMessages } from '../chatbot/botEngine.js'
import { STATES } from '../chatbot/states.js'

// ── Mock del store ────────────────────────────────────────────────────────────

function createStore(overrides = {}) {
    return {
        getOrCreatePatient: vi.fn((name) => ({ id: 'p1', name })),
        findDoctor: vi.fn(() => null),
        getPatients: vi.fn(() => []),
        getRecordsByPatient: vi.fn(() => []),
        addRecord: vi.fn((patientId, vitals) => ({ id: 'r1', patientId, ...vitals })),
        deleteRecord: vi.fn(() => true),
        addObservation: vi.fn(() => true),
        ...overrides,
    }
}

// ── getWelcomeMessages ────────────────────────────────────────────────────────

describe('getWelcomeMessages', () => {
    it('retorna dos mensajes de bienvenida tipo bot', () => {
        const msgs = getWelcomeMessages()
        expect(msgs).toHaveLength(2)
        expect(msgs.every(m => m.type === 'bot')).toBe(true)
    })
    it('menciona Paciente y Médico', () => {
        const text = getWelcomeMessages().map(m => m.text).join(' ')
        expect(text).toContain('Paciente')
        expect(text).toContain('Médico')
    })
})

// ── WELCOME ───────────────────────────────────────────────────────────────────

describe('Estado WELCOME', () => {
    const store = createStore()

    it('opción 1 → PATIENT_NAME', () => {
        const r = process('1', STATES.WELCOME, {}, store)
        expect(r.nextState).toBe(STATES.PATIENT_NAME)
    })

    it('opción 2 → DOCTOR_NAME', () => {
        const r = process('2', STATES.WELCOME, {}, store)
        expect(r.nextState).toBe(STATES.DOCTOR_NAME)
    })

    it('opción inválida permanece en WELCOME con mensaje de error', () => {
        const r = process('9', STATES.WELCOME, {}, store)
        expect(r.nextState).toBe(STATES.WELCOME)
        expect(r.messages[0].type).toBe('bot-error')
    })
})

// ── PATIENT_NAME ──────────────────────────────────────────────────────────────

describe('Estado PATIENT_NAME', () => {
    it('nombre válido → PATIENT_MENU con saludo', () => {
        const store = createStore()
        const r = process('Juan Pérez', STATES.PATIENT_NAME, {}, store)
        expect(r.nextState).toBe(STATES.PATIENT_MENU)
        expect(store.getOrCreatePatient).toHaveBeenCalledWith('Juan Pérez')
        expect(r.context.userType).toBe('patient')
    })

    it('nombre vacío → permanece en PATIENT_NAME con error', () => {
        const store = createStore()
        const r = process('   ', STATES.PATIENT_NAME, {}, store)
        expect(r.nextState).toBe(STATES.PATIENT_NAME)
        expect(r.messages[0].type).toBe('bot-error')
    })
})

// ── DOCTOR_NAME / DOCTOR_PASSWORD ─────────────────────────────────────────────

describe('Autenticación médico', () => {
    it('nombre médico → solicita contraseña', () => {
        const store = createStore()
        const r = process('Dr. García', STATES.DOCTOR_NAME, {}, store)
        expect(r.nextState).toBe(STATES.DOCTOR_PASSWORD)
        expect(r.context.doctorNameAttempt).toBe('Dr. García')
    })

    it('contraseña correcta → DOCTOR_MENU', () => {
        const doctor = { id: 'doc1', name: 'Dr. García' }
        const store = createStore({ findDoctor: vi.fn(() => doctor) })
        const ctx = { doctorNameAttempt: 'Dr. García' }
        const r = process('1234', STATES.DOCTOR_PASSWORD, ctx, store)
        expect(r.nextState).toBe(STATES.DOCTOR_MENU)
        expect(r.context.userType).toBe('doctor')
    })

    it('contraseña incorrecta → vuelve a DOCTOR_NAME con error', () => {
        const store = createStore({ findDoctor: vi.fn(() => null) })
        const ctx = { doctorNameAttempt: 'Dr. García' }
        const r = process('wrong', STATES.DOCTOR_PASSWORD, ctx, store)
        expect(r.nextState).toBe(STATES.DOCTOR_NAME)
        expect(r.messages[0].type).toBe('bot-error')
    })
})

// ── PATIENT_MENU ──────────────────────────────────────────────────────────────

describe('Estado PATIENT_MENU', () => {
    const ctx = { currentUser: { id: 'p1', name: 'Ana' } }

    it('opción 1 → REG_SYSTOLIC', () => {
        const r = process('1', STATES.PATIENT_MENU, ctx, createStore())
        expect(r.nextState).toBe(STATES.REG_SYSTOLIC)
        expect(r.context.vitals).toEqual({})
    })

    it('opción 2 sin registros → permanece en PATIENT_MENU', () => {
        const r = process('2', STATES.PATIENT_MENU, ctx, createStore())
        expect(r.nextState).toBe(STATES.PATIENT_MENU)
    })

    it('opción 2 con registros → VIEW_RECORDS', () => {
        const store = createStore({
            getRecordsByPatient: vi.fn(() => [{
                id: 'r1', patientId: 'p1',
                dateTime: new Date().toISOString(),
                systolic: 120, diastolic: 80, heartRate: 72,
                temperature: null, oxygenSat: null, observation: null,
            }]),
        })
        const r = process('2', STATES.PATIENT_MENU, ctx, store)
        expect(r.nextState).toBe(STATES.VIEW_RECORDS)
    })

    it('opción 3 sin registros → permanece en PATIENT_MENU', () => {
        const r = process('3', STATES.PATIENT_MENU, ctx, createStore())
        expect(r.nextState).toBe(STATES.PATIENT_MENU)
    })

    it('opción 4 → WELCOME (logout)', () => {
        const r = process('4', STATES.PATIENT_MENU, ctx, createStore())
        expect(r.nextState).toBe(STATES.WELCOME)
    })

    it('opción inválida → permanece en PATIENT_MENU con error', () => {
        const r = process('9', STATES.PATIENT_MENU, ctx, createStore())
        expect(r.nextState).toBe(STATES.PATIENT_MENU)
        expect(r.messages[0].type).toBe('bot-error')
    })
})

// ── Registro de signos vitales ────────────────────────────────────────────────

describe('Registro signos vitales', () => {
    const baseCtx = {
        currentUser: { id: 'p1', name: 'Ana' },
        vitals: {},
    }

    it('sistólica válida → REG_DIASTOLIC', () => {
        const r = process('120', STATES.REG_SYSTOLIC, baseCtx, createStore())
        expect(r.nextState).toBe(STATES.REG_DIASTOLIC)
        expect(r.context.vitals.systolic).toBe(120)
    })

    it('sistólica inválida → permanece en REG_SYSTOLIC', () => {
        const r = process('999', STATES.REG_SYSTOLIC, baseCtx, createStore())
        expect(r.nextState).toBe(STATES.REG_SYSTOLIC)
        expect(r.messages[0].type).toBe('bot-error')
    })

    it('diastólica válida → REG_HEART_RATE', () => {
        const ctx = { ...baseCtx, vitals: { systolic: 120 } }
        const r = process('80', STATES.REG_DIASTOLIC, ctx, createStore())
        expect(r.nextState).toBe(STATES.REG_HEART_RATE)
        expect(r.context.vitals.diastolic).toBe(80)
    })

    it('diastólica ≥ sistólica → error, permanece en REG_DIASTOLIC', () => {
        const ctx = { ...baseCtx, vitals: { systolic: 100 } }
        const r = process('110', STATES.REG_DIASTOLIC, ctx, createStore())
        expect(r.nextState).toBe(STATES.REG_DIASTOLIC)
        expect(r.messages[0].type).toBe('bot-error')
    })

    it('frecuencia cardíaca válida → REG_TEMP_ASK', () => {
        const ctx = { ...baseCtx, vitals: { systolic: 120, diastolic: 80 } }
        const r = process('72', STATES.REG_HEART_RATE, ctx, createStore())
        expect(r.nextState).toBe(STATES.REG_TEMP_ASK)
        expect(r.context.vitals.heartRate).toBe(72)
    })

    it('REG_TEMP_ASK "s" → REG_TEMP', () => {
        const ctx = { ...baseCtx, vitals: { systolic: 120, diastolic: 80, heartRate: 72 } }
        const r = process('s', STATES.REG_TEMP_ASK, ctx, createStore())
        expect(r.nextState).toBe(STATES.REG_TEMP)
    })

    it('REG_TEMP_ASK "n" → REG_OXSAT_ASK', () => {
        const ctx = { ...baseCtx, vitals: { systolic: 120, diastolic: 80, heartRate: 72 } }
        const r = process('n', STATES.REG_TEMP_ASK, ctx, createStore())
        expect(r.nextState).toBe(STATES.REG_OXSAT_ASK)
    })

    it('REG_OXSAT_ASK "n" → guarda registro y PATIENT_MENU', () => {
        const store = createStore()
        const ctx = { ...baseCtx, vitals: { systolic: 120, diastolic: 80, heartRate: 72 } }
        const r = process('n', STATES.REG_OXSAT_ASK, ctx, store)
        expect(store.addRecord).toHaveBeenCalledOnce()
        expect(r.nextState).toBe(STATES.PATIENT_MENU)
    })

    it('REG_OXSAT válido → guarda registro y PATIENT_MENU', () => {
        const store = createStore()
        const ctx = { ...baseCtx, vitals: { systolic: 120, diastolic: 80, heartRate: 72 } }
        const r = process('97', STATES.REG_OXSAT, ctx, store)
        expect(store.addRecord).toHaveBeenCalledOnce()
        expect(r.nextState).toBe(STATES.PATIENT_MENU)
    })
})

// ── Alertas clínicas ──────────────────────────────────────────────────────────

describe('Alertas clínicas en el registro', () => {
    const baseCtx = { currentUser: { id: 'p1', name: 'Ana' }, vitals: {} }

    it('sistólica en crisis → incluye mensaje bot-alert', () => {
        const r = process('190', STATES.REG_SYSTOLIC, baseCtx, createStore())
        expect(r.messages.some(m => m.type === 'bot-alert')).toBe(true)
    })

    it('frecuencia cardíaca con taquicardia → incluye bot-alert', () => {
        const ctx = { ...baseCtx, vitals: { systolic: 120, diastolic: 80 } }
        const r = process('110', STATES.REG_HEART_RATE, ctx, createStore())
        expect(r.messages.some(m => m.type === 'bot-alert')).toBe(true)
    })
})

// ── DELETE_SELECT ─────────────────────────────────────────────────────────────

describe('Estado DELETE_SELECT', () => {
    const record = {
        id: 'r1', patientId: 'p1',
        dateTime: new Date().toISOString(),
        systolic: 120, diastolic: 80, heartRate: 72,
        temperature: null, oxygenSat: null, observation: null,
    }

    it('número válido → elimina y vuelve a PATIENT_MENU', () => {
        const store = createStore({ getRecordsByPatient: vi.fn(() => [record]) })
        const ctx = { currentUser: { id: 'p1', name: 'Ana' } }
        const r = process('1', STATES.DELETE_SELECT, ctx, store)
        expect(store.deleteRecord).toHaveBeenCalledWith('r1')
        expect(r.nextState).toBe(STATES.PATIENT_MENU)
    })

    it('"cancelar" → vuelve a PATIENT_MENU sin eliminar', () => {
        const store = createStore({ getRecordsByPatient: vi.fn(() => [record]) })
        const ctx = { currentUser: { id: 'p1', name: 'Ana' } }
        const r = process('cancelar', STATES.DELETE_SELECT, ctx, store)
        expect(store.deleteRecord).not.toHaveBeenCalled()
        expect(r.nextState).toBe(STATES.PATIENT_MENU)
    })

    it('número fuera de rango → error, permanece en DELETE_SELECT', () => {
        const store = createStore({ getRecordsByPatient: vi.fn(() => [record]) })
        const ctx = { currentUser: { id: 'p1', name: 'Ana' } }
        const r = process('99', STATES.DELETE_SELECT, ctx, store)
        expect(r.nextState).toBe(STATES.DELETE_SELECT)
        expect(r.messages[0].type).toBe('bot-error')
    })
})

// ── DOCTOR_MENU ───────────────────────────────────────────────────────────────

describe('Estado DOCTOR_MENU', () => {
    const ctx = { currentUser: { id: 'doc1', name: 'Dr. García' }, userType: 'doctor' }

    it('opción 1 sin pacientes → permanece en DOCTOR_MENU', () => {
        const r = process('1', STATES.DOCTOR_MENU, ctx, createStore())
        expect(r.nextState).toBe(STATES.DOCTOR_MENU)
    })

    it('opción 1 con pacientes → lista pacientes', () => {
        const store = createStore({
            getPatients: vi.fn(() => [{ id: 'p1', name: 'Ana' }]),
        })
        const r = process('1', STATES.DOCTOR_MENU, ctx, store)
        expect(r.messages[0].text).toContain('Ana')
    })

    it('opción 4 → logout WELCOME', () => {
        const r = process('4', STATES.DOCTOR_MENU, ctx, createStore())
        expect(r.nextState).toBe(STATES.WELCOME)
    })

    it('opción inválida → error y permanece en DOCTOR_MENU', () => {
        const r = process('9', STATES.DOCTOR_MENU, ctx, createStore())
        expect(r.nextState).toBe(STATES.DOCTOR_MENU)
        expect(r.messages[0].type).toBe('bot-error')
    })
})

// ── Estado desconocido ────────────────────────────────────────────────────────

describe('Estado desconocido', () => {
    it('reinicia al estado WELCOME', () => {
        const r = process('algo', 'ESTADO_INVALIDO', {}, createStore())
        expect(r.nextState).toBe(STATES.WELCOME)
    })
})
