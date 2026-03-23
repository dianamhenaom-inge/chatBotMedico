/**
 * dataStore.test.js
 * Pruebas unitarias para el composable useStore (capa de datos).
 *
 * Estrategia: se mocka localStorage y se re-importa el módulo en cada test
 * para garantizar un estado limpio (el state es un singleton de módulo).
 */

import { beforeEach, describe, it, expect, vi } from 'vitest'

// ── Mock de localStorage ──────────────────────────────────────────────────────
const localStorageMock = (() => {
    let _store = {}
    return {
        getItem: (key) => _store[key] ?? null,
        setItem: (key, value) => { _store[key] = String(value) },
        removeItem: (key) => { delete _store[key] },
        clear: () => { _store = {} },
    }
})()

vi.stubGlobal('localStorage', localStorageMock)

// ── Setup: estado fresco por cada test ───────────────────────────────────────
let store

beforeEach(async () => {
    localStorageMock.clear()
    vi.resetModules()
    const { useStore } = await import('./dataStore.js')
    store = useStore()
})

// ── getPatients ───────────────────────────────────────────────────────────────

describe('getPatients', () => {
    it('devuelve lista vacía cuando no hay pacientes', () => {
        expect(store.getPatients()).toEqual([])
    })

    it('devuelve los pacientes creados', () => {
        store.getOrCreatePatient('Ana López')
        store.getOrCreatePatient('Carlos Ruiz')
        expect(store.getPatients()).toHaveLength(2)
    })
})

// ── getOrCreatePatient ────────────────────────────────────────────────────────

describe('getOrCreatePatient', () => {
    it('crea un paciente nuevo con nombre y id', () => {
        const patient = store.getOrCreatePatient('María Gómez')
        expect(patient.name).toBe('María Gómez')
        expect(patient.id).toMatch(/^p_/)
    })

    it('reutiliza el paciente existente (no crea duplicado)', () => {
        const p1 = store.getOrCreatePatient('Luis Torres')
        const p2 = store.getOrCreatePatient('Luis Torres')
        expect(p1.id).toBe(p2.id)
        expect(store.getPatients()).toHaveLength(1)
    })

    it('es insensible a mayúsculas al buscar el paciente', () => {
        const p1 = store.getOrCreatePatient('Pedro Herrera')
        const p2 = store.getOrCreatePatient('pedro herrera')
        expect(p1.id).toBe(p2.id)
    })

    it('normaliza espacios en el nombre al crearlo', () => {
        const patient = store.getOrCreatePatient('  Ana Pérez  ')
        expect(patient.name).toBe('Ana Pérez')
    })
})

// ── findPatient ───────────────────────────────────────────────────────────────

describe('findPatient', () => {
    it('retorna undefined si no existe el paciente', () => {
        expect(store.findPatient('Desconocido')).toBeUndefined()
    })

    it('encuentra un paciente existente por nombre', () => {
        store.getOrCreatePatient('Sofía Castro')
        const found = store.findPatient('Sofía Castro')
        expect(found).toBeDefined()
        expect(found.name).toBe('Sofía Castro')
    })
})

// ── findDoctor ────────────────────────────────────────────────────────────────

describe('findDoctor', () => {
    it('retorna el médico con credenciales correctas (Dr. García)', () => {
        const doctor = store.findDoctor('Dr. García', '1234')
        expect(doctor).toBeDefined()
        expect(doctor.name).toBe('Dr. García')
    })

    it('retorna el médico con credenciales correctas (Dra. Martínez)', () => {
        const doctor = store.findDoctor('Dra. Martínez', '5678')
        expect(doctor).toBeDefined()
    })

    it('retorna undefined con contraseña incorrecta', () => {
        expect(store.findDoctor('Dr. García', 'wrong')).toBeUndefined()
    })

    it('retorna undefined con nombre incorrecto', () => {
        expect(store.findDoctor('Dr. Nadie', '1234')).toBeUndefined()
    })

    it('es insensible a mayúsculas en el nombre del médico', () => {
        const doctor = store.findDoctor('dr. garcía', '1234')
        expect(doctor).toBeDefined()
    })
})

// ── addRecord ─────────────────────────────────────────────────────────────────

describe('addRecord', () => {
    it('crea un registro con todos los campos requeridos', () => {
        const patient = store.getOrCreatePatient('Paciente Test')
        const record = store.addRecord(patient.id, {
            systolic: 120,
            diastolic: 80,
            heartRate: 70,
            dateTime: '2025-01-01T10:00:00.000Z',
        })

        expect(record.id).toMatch(/^r_/)
        expect(record.patientId).toBe(patient.id)
        expect(record.systolic).toBe(120)
        expect(record.diastolic).toBe(80)
        expect(record.heartRate).toBe(70)
        expect(record.observation).toBeNull()
    })

    it('los campos opcionales son null por defecto', () => {
        const patient = store.getOrCreatePatient('Paciente Test')
        const record = store.addRecord(patient.id, {
            systolic: 115, diastolic: 75, heartRate: 65,
        })
        expect(record.temperature).toBeNull()
        expect(record.oxygenSat).toBeNull()
    })

    it('guarda temperatura y saturación cuando se proporcionan', () => {
        const patient = store.getOrCreatePatient('Paciente Test')
        const record = store.addRecord(patient.id, {
            systolic: 115, diastolic: 75, heartRate: 65,
            temperature: 36.8, oxygenSat: 98,
        })
        expect(record.temperature).toBe(36.8)
        expect(record.oxygenSat).toBe(98)
    })

    it('usa la fecha actual si no se proporciona dateTime', () => {
        const before = new Date().toISOString()
        const patient = store.getOrCreatePatient('Paciente Test')
        const record = store.addRecord(patient.id, {
            systolic: 115, diastolic: 75, heartRate: 65,
        })
        const after = new Date().toISOString()
        expect(record.dateTime >= before).toBe(true)
        expect(record.dateTime <= after).toBe(true)
    })
})

// ── getRecordsByPatient ───────────────────────────────────────────────────────

describe('getRecordsByPatient', () => {
    it('devuelve lista vacía para paciente sin registros', () => {
        const patient = store.getOrCreatePatient('Sin Registros')
        expect(store.getRecordsByPatient(patient.id)).toEqual([])
    })

    it('devuelve solo los registros del paciente indicado', () => {
        const p1 = store.getOrCreatePatient('Paciente Uno')
        const p2 = store.getOrCreatePatient('Paciente Dos')
        store.addRecord(p1.id, { systolic: 120, diastolic: 80, heartRate: 70 })
        store.addRecord(p1.id, { systolic: 125, diastolic: 82, heartRate: 72 })
        store.addRecord(p2.id, { systolic: 110, diastolic: 70, heartRate: 65 })

        expect(store.getRecordsByPatient(p1.id)).toHaveLength(2)
        expect(store.getRecordsByPatient(p2.id)).toHaveLength(1)
    })
})

// ── deleteRecord ──────────────────────────────────────────────────────────────

describe('deleteRecord', () => {
    it('elimina un registro existente y retorna true', () => {
        const patient = store.getOrCreatePatient('Paciente Test')
        const record = store.addRecord(patient.id, {
            systolic: 120, diastolic: 80, heartRate: 70,
        })
        const result = store.deleteRecord(record.id)
        expect(result).toBe(true)
        expect(store.getRecordsByPatient(patient.id)).toHaveLength(0)
    })

    it('retorna false al intentar eliminar un id inexistente', () => {
        expect(store.deleteRecord('r_inexistente_123')).toBe(false)
    })

    it('solo elimina el registro indicado, no los demás', () => {
        const patient = store.getOrCreatePatient('Paciente Test')
        const r1 = store.addRecord(patient.id, { systolic: 120, diastolic: 80, heartRate: 70 })
        store.addRecord(patient.id, { systolic: 125, diastolic: 82, heartRate: 72 })

        store.deleteRecord(r1.id)
        expect(store.getRecordsByPatient(patient.id)).toHaveLength(1)
    })
})

// ── addObservation ────────────────────────────────────────────────────────────

describe('addObservation', () => {
    it('agrega observación a un registro y retorna true', () => {
        const patient = store.getOrCreatePatient('Paciente Test')
        const record = store.addRecord(patient.id, {
            systolic: 150, diastolic: 95, heartRate: 90,
        })
        const result = store.addObservation(record.id, 'Requiere control')
        expect(result).toBe(true)
    })

    it('la observación queda guardada en el registro', () => {
        const patient = store.getOrCreatePatient('Paciente Test')
        const record = store.addRecord(patient.id, {
            systolic: 150, diastolic: 95, heartRate: 90,
        })
        store.addObservation(record.id, 'Controlar en 48h')
        const records = store.getRecordsByPatient(patient.id)
        expect(records[0].observation).toBe('Controlar en 48h')
    })

    it('retorna false si el id del registro no existe', () => {
        expect(store.addObservation('r_noexiste', 'obs')).toBe(false)
    })

    it('reemplaza una observación anterior', () => {
        const patient = store.getOrCreatePatient('Paciente Test')
        const record = store.addRecord(patient.id, {
            systolic: 150, diastolic: 95, heartRate: 90,
        })
        store.addObservation(record.id, 'Primera observación')
        store.addObservation(record.id, 'Segunda observación')
        const records = store.getRecordsByPatient(patient.id)
        expect(records[0].observation).toBe('Segunda observación')
    })
})
