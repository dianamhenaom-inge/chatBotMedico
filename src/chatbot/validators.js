/**
 * validators.js
 * ---------------
 * Validación de signos vitales y rangos normales de referencia.
 */

// TODO: definir rangos de referencia para cada signo vital
export const RANGES = {}

/**
 * Valida que un valor esté dentro del rango aceptable.
 * @param {string|number} rawValue
 * @param {{ min, max, label }} opciones
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
export function validateNumber(rawValue, { min, max, label }) {
  // TODO: implementar validación
}

/**
 * Devuelve una advertencia si el signo vital está fuera del rango normal.
 * @param {string} type  - 'systolic' | 'diastolic' | 'heartRate' | 'temperature' | 'oxygenSat'
 * @param {number} value
 * @returns {string|null}
 */
export function getVitalAlert(type, value) {
  // TODO: implementar alertas clínicas
}

/**
 * Formatea un registro como texto legible para el chat.
 * @param {object} record
 * @param {number} index  - número de lista (1-based)
 * @returns {string}
 */
export function formatRecord(record, index) {
  // TODO: implementar formato de registro
}
