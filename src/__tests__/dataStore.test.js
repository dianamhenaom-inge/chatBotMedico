import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock de Vue para que `reactive` sea un passthrough sin dependencia del DOM
vi.mock('vue', () => ({
    reactive: (obj) => obj,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

async function freshStore() {
    // Resetea módulos para obtener estado limpio en cada test
    vi.resetModules()
    vi.mock('vue', () => ({ reactive: (obj) => obj }))
    const { useStore } = await import('../store/dataStore.js')
    return useStore()
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('dataStore — pacientes', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('getOrCreatePatient crea un paciente nuevo', async () => {
        const store = await freshStore()
        const p = store.getOrCreatePatient('María López')
        expect(p.name).toBe('María López')
        expect(p.id).toBeTruthy()
    })

    it('getOrCreatePatient retorna el mismo paciente si ya existe', async () => {
        const store = await freshStore()
        const p1 = store.getOrCreatePatient('Carlos Ruiz')
        const p2 = store.getOrCreatePatient('carlos ruiz') // normalización de nombre
        expect(p1.id).toBe(p2.id)
    })

    it('findPatient retorna undefined si no existe', async () => {
        const store = await freshStore()
        expect(store.findPatient('Nadie')).toBeUndefined()
    })

    it('findPatient localiza al paciente sin importar mayúsculas', async () => {
        const store = await freshStore()
        store.getOrCreatePatient('ANA GARCIA')
        const found = store.findPatient('ana garcia')
        expect(found).toBeDefined()
        expect(found.name).toBe('ANA GARCIA')
    })

    it('getPatients retorna todos los pacientes', async () => {
        const store = await freshStore()
        store.getOrCreatePatient('Pedro')
        store.getOrCreatePatient('Lucía')
        expect(store.getPatients().length).toBe(2)
    })
})

describe('dataStore — médicos', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('findDoctor localiza al médico con credenciales correctas', async () => {
        const store = await freshStore()
        const doc = store.findDoctor('Dr. García', '1234')
        expect(doc).toBeDefined()
        expect(doc.name).toBe('Dr. García')
    })

    it('findDoctor retorna undefined con contraseña incorrecta', async () => {
        const store = await freshStore()
        expect(store.findDoctor('Dr. García', 'wrong')).toBeUndefined()
    })

    it('findDoctor retorna undefined con nombre inexistente', async () => {
        const store = await freshStore()
        expect(store.findDoctor('Dr. Nadie', '1234')).toBeUndefined()
    })

    it('findDoctor funciona insensible a mayúsculas', async () => {
        const store = await freshStore()
        const doc = store.findDoctor('dr. garcía', '1234')
        expect(doc).toBeDefined()
    })
})

describe('dataStore — registros', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('addRecord crea un registro vinculado al paciente', async () => {
        const store = await freshStore()
        const p = store.getOrCreatePatient('Luis')
        const vitals = { systolic: 120, diastolic: 80, heartRate: 72 }
        const r = store.addRecord(p.id, vitals)
        expect(r.patientId).toBe(p.id)
        expect(r.systolic).toBe(120)
        expect(r.id).toBeTruthy()
    })

    it('addRecord asigna null a campos opcionales no provistos', async () => {
        const store = await freshStore()
        const p = store.getOrCreatePatient('Luis')
        const r = store.addRecord(p.id, { systolic: 120, diastolic: 80, heartRate: 72 })
        expect(r.temperature).toBeNull()
        expect(r.oxygenSat).toBeNull()
        expect(r.observation).toBeNull()
    })

    it('getRecordsByPatient retorna sólo los registros del paciente', async () => {
        const store = await freshStore()
        const p1 = store.getOrCreatePatient('Ana')
        const p2 = store.getOrCreatePatient('Beto')
        store.addRecord(p1.id, { systolic: 120, diastolic: 80, heartRate: 72 })
        store.addRecord(p1.id, { systolic: 115, diastolic: 75, heartRate: 68 })
        store.addRecord(p2.id, { systolic: 130, diastolic: 85, heartRate: 80 })

        expect(store.getRecordsByPatient(p1.id)).toHaveLength(2)
        expect(store.getRecordsByPatient(p2.id)).toHaveLength(1)
    })

    it('deleteRecord elimina el registro correctamente', async () => {
        const store = await freshStore()
        const p = store.getOrCreatePatient('Carmen')
        const r = store.addRecord(p.id, { systolic: 120, diastolic: 80, heartRate: 72 })
        expect(store.deleteRecord(r.id)).toBe(true)
        expect(store.getRecordsByPatient(p.id)).toHaveLength(0)
    })

    it('deleteRecord retorna false si el registro no existe', async () => {
        const store = await freshStore()
        expect(store.deleteRecord('id-inexistente')).toBe(false)
    })

    it('addObservation guarda la observación en el registro', async () => {
        const store = await freshStore()
        const p = store.getOrCreatePatient('Diego')
        const r = store.addRecord(p.id, { systolic: 120, diastolic: 80, heartRate: 72 })
        expect(store.addObservation(r.id, 'Paciente estable')).toBe(true)

        const records = store.getRecordsByPatient(p.id)
        expect(records[0].observation).toBe('Paciente estable')
    })

    it('addObservation retorna false si el registro no existe', async () => {
        const store = await freshStore()
        expect(store.addObservation('id-inexistente', 'obs')).toBe(false)
    })
})
