/**
 * dataStore.js
 * ---------------
 * Composable reactivo que actúa como capa de datos de la aplicación.
 * Persiste toda la información en localStorage para que sobreviva recargas.
 *
 * Entidades manejadas:
 *  - patients  : lista de pacientes registrados
 *  - doctors   : lista de médicos (pre-cargados)
 *  - records   : registros de signos vitales (vinculados a patientId)
 */

import {reactive} from 'vue'

const SEED_DOCTORS = [
    {id: 'doc1', name: 'Dr. García', password: '1234'},
    {id: 'doc2', name: 'Dra. Martínez', password: '5678'},
]

function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch (error) {
        console.warn('Error loading', key, error)
        return fallback
    }
}

function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Error saving', key, error)
    }
}

const state = reactive({
    patients: load('patients', []),
    doctors: load('doctors', SEED_DOCTORS),
    records: load('records', []),
})

function persist() {
    save('patients', state.patients)
    save('doctors', state.doctors)
    save('records', state.records)
}

function normalizeName(name) {
    return name.trim().toLowerCase()
}

function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function getPatients() {
    return state.patients
}

function findPatient(name) {
    const normalized = normalizeName(name)
    return state.patients.find(
        p => normalizeName(p.name) === normalized
    )
}

function findDoctor(name, password) {
    const normalized = normalizeName(name)

    return state.doctors.find(
        d => normalizeName(d.name) === normalized && d.password === password
    )
}

function getOrCreatePatient(name) {
    let patient = findPatient(name)

    if (!patient) {
        patient = {
            id: generateId('p'),
            name: name.trim(),
        }

        state.patients.push(patient)
        persist()
    }

    return patient
}

function getRecordsByPatient(patientId) {
    return state.records.filter(r => r.patientId === patientId)
}

function addRecord(patientId, vitals) {

    const record = {
        id: generateId('r'),
        patientId,
        dateTime: vitals.dateTime || new Date().toISOString(),

        systolic: vitals.systolic,
        diastolic: vitals.diastolic,
        heartRate: vitals.heartRate,

        temperature: vitals.temperature ?? null,
        oxygenSat: vitals.oxygenSat ?? null,

        observation: null,
    }

    state.records.push(record)
    persist()

    return record
}

function deleteRecord(recordId) {
    const idx = state.records.findIndex(r => r.id === recordId)

    if (idx !== -1) {
        state.records.splice(idx, 1)
        persist()
        return true
    }

    return false
}

function addObservation(recordId, observation) {
    const record = state.records.find(r => r.id === recordId)

    if (record) {
        record.observation = observation.trim()
        persist()
        return true
    }

    return false
}

export function useStore() {
    return {
        getPatients,
        findPatient,
        findDoctor,
        getOrCreatePatient,
        getRecordsByPatient,
        addRecord,
        deleteRecord,
        addObservation,
    }
}