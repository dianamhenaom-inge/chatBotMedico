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

import { reactive } from 'vue'

// ── Datos iniciales de médicos ─────────────────────────────────────────────
const SEED_DOCTORS = [
  { id: 'doc1', name: 'Dr. García',   password: '1234' },
  { id: 'doc2', name: 'Dra. Martínez', password: '5678' },
]

// ── Helpers de persistencia ────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Estado reactivo ────────────────────────────────────────────────────────
const state = reactive({
  patients: load('patients', []),
  doctors:  load('doctors',  SEED_DOCTORS),
  records:  load('records',  []),
})

// Persiste automáticamente cada vez que se modifica state
// (se llama manualmente al mutar para no necesitar watchers profundos)
function persist() {
  save('patients', state.patients)
  save('doctors',  state.doctors)
  save('records',  state.records)
}

// ── API pública ────────────────────────────────────────────────────────────

/** Devuelve todos los pacientes */
function getPatients() {
  return state.patients
}

/** Busca un paciente por nombre (insensible a mayúsculas) */
function findPatient(name) {
  return state.patients.find(
    p => p.name.toLowerCase() === name.trim().toLowerCase()
  )
}

/** Busca un médico por nombre e ID */
function findDoctor(name, password) {
  return state.doctors.find(
    d => d.name.toLowerCase() === name.trim().toLowerCase() && d.password === password
  )
}

/** Crea o devuelve el paciente con ese nombre */
function getOrCreatePatient(name) {
  let patient = findPatient(name)
  if (!patient) {
    patient = {
      id:   `p_${Date.now()}`,
      name: name.trim(),
    }
    state.patients.push(patient)
    persist()
  }
  return patient
}

/** Devuelve los registros de un paciente */
function getRecordsByPatient(patientId) {
  return state.records.filter(r => r.patientId === patientId)
}

/**
 * Agrega un registro de signos vitales.
 * @param {string} patientId
 * @param {object} vitals - { systolic, diastolic, heartRate, dateTime, temperature?, oxygenSat? }
 */
function addRecord(patientId, vitals) {
  const record = {
    id:          `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    patientId,
    dateTime:    vitals.dateTime || new Date().toISOString(),
    systolic:    vitals.systolic,
    diastolic:   vitals.diastolic,
    heartRate:   vitals.heartRate,
    temperature: vitals.temperature ?? null,
    oxygenSat:   vitals.oxygenSat  ?? null,
    observation: null,  // observación del médico
  }
  state.records.push(record)
  persist()
  return record
}

/** Elimina un registro por ID */
function deleteRecord(recordId) {
  const idx = state.records.findIndex(r => r.id === recordId)
  if (idx !== -1) {
    state.records.splice(idx, 1)
    persist()
    return true
  }
  return false
}

/** Agrega u overwrite la observación del médico en un registro */
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
