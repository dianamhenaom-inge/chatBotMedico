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

/**
 * Médicos iniciales disponibles en el sistema.
 * Se cargan solo si no existen datos persistidos.
 */
const SEED_DOCTORS = [
    {id: 'doc1', name: 'Dr. García', password: '1234'},
    {id: 'doc2', name: 'Dra. Martínez', password: '5678'},
]

/**
 * Carga un valor desde localStorage.
 *
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch (error) {
        console.warn('Error loading', key, error)
        return fallback
    }
}

/**
 * Guarda un valor en localStorage.
 *
 * @param {string} key
 * @param {any} value
 */
function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Error saving', key, error)
    }
}

/**
 * Estado reactivo global del store.
 */
const state = reactive({
    patients: load('patients', []),
    doctors: load('doctors', SEED_DOCTORS),
    records: load('records', []),
})

/**
 * Persiste el estado actual en localStorage.
 */
function persist() {
    save('patients', state.patients)
    save('doctors', state.doctors)
    save('records', state.records)
}

/**
 * Normaliza un nombre para comparaciones.
 *
 * @param {string} name
 * @returns {string}
 */
function normalizeName(name) {
    return name.trim().toLowerCase()
}

/**
 * Genera un identificador único simple.
 *
 * @param {string} prefix
 * @returns {string}
 */
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Devuelve todos los pacientes registrados.
 *
 * @returns {Array}
 */
function getPatients() {
    return state.patients
}

/**
 * Busca un paciente por nombre (insensible a mayúsculas).
 *
 * @param {string} name
 * @returns {object|undefined}
 */
function findPatient(name) {
    const normalized = normalizeName(name)

    return state.patients.find(
        p => normalizeName(p.name) === normalized
    )
}

/**
 * Busca un médico por nombre y contraseña.
 *
 * @param {string} name
 * @param {string} password
 * @returns {object|undefined}
 */
function findDoctor(name, password) {
    const normalized = normalizeName(name)

    return state.doctors.find(
        d => normalizeName(d.name) === normalized && d.password === password
    )
}

/**
 * Devuelve un paciente existente o crea uno nuevo si no existe.
 *
 * @param {string} name
 * @returns {object}
 */
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

/**
 * Obtiene los registros asociados a un paciente.
 *
 * @param {string} patientId
 * @returns {Array}
 */
function getRecordsByPatient(patientId) {
    return state.records.filter(
        r => r.patientId === patientId
    )
}

/**
 * Crea un registro de signos vitales.
 *
 * @param {string} patientId
 * @param {object} vitals
 * @param {number} vitals.systolic
 * @param {number} vitals.diastolic
 * @param {number} vitals.heartRate
 * @param {string} [vitals.dateTime]
 * @param {number|null} [vitals.temperature]
 * @param {number|null} [vitals.oxygenSat]
 *
 * @returns {object}
 */
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

/**
 * Elimina un registro por su ID.
 *
 * @param {string} recordId
 * @returns {boolean}
 */
function deleteRecord(recordId) {

    const idx = state.records.findIndex(
        r => r.id === recordId
    )

    if (idx !== -1) {
        state.records.splice(idx, 1)
        persist()
        return true
    }

    return false
}

/**
 * Agrega o reemplaza la observación de un registro.
 *
 * @param {string} recordId
 * @param {string} observation
 * @returns {boolean}
 */
function addObservation(recordId, observation) {

    const record = state.records.find(
        r => r.id === recordId
    )

    if (record) {
        record.observation = observation.trim()
        persist()
        return true
    }

    return false
}

/**
 * Composable que expone la API del store.
 *
 * @returns {object}
 */
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