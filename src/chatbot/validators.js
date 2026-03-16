/**
 * validators.js
 * ---------------
 * Funciones de validación de signos vitales y rangos normales.
 * Los rangos de referencia siguen las guías de la OMS/ACC/AHA.
 */

// ── Rangos de referencia ──────────────────────────────────────────────────
export const RANGES = {
    systolic: {min: 70, max: 250, normalMax: 120, unit: 'mmHg'},
    diastolic: {min: 40, max: 150, normalMax: 80, unit: 'mmHg'},
    heartRate: {min: 30, max: 220, normalMin: 60, normalMax: 100, unit: 'lpm'},
    temperature: {min: 34.0, max: 42.0, normalMin: 36.0, normalMax: 37.5, unit: '°C'},
    oxygenSat: {min: 50, max: 100, normalMin: 95, unit: '%'},
}

/**
 * Valida un número dentro de un rango aceptable.
 * @returns {{ valid: boolean, value: number, error?: string }}
 */
export function validateNumber(rawValue, {min, max, label}) {
    const n = parseFloat(String(rawValue).replace(',', '.'))
    if (isNaN(n)) return {valid: false, error: `"${rawValue}" no es un número válido.`}
    if (n < min) return {valid: false, error: `El valor mínimo para ${label} es ${min}.`}
    if (n > max) return {valid: false, error: `El valor máximo para ${label} es ${max}.`}
    return {valid: true, value: n}
}

/**
 * Evalúa si un signo vital está fuera del rango normal y
 * devuelve una advertencia textual para mostrar al usuario.
 */
export function getVitalAlert(type, value) {
    const r = RANGES[type]
    if (!r) return null

    switch (type) {
        case 'systolic':
            if (value >= 180) return '🚨 CRISIS HIPERTENSIVA — consulte urgencias.'
            if (value >= 140) return '⚠️ Hipertensión estadio 2.'
            if (value >= 130) return '⚠️ Hipertensión estadio 1.'
            if (value >= 120) return '⚠️ Presión elevada (pre-hipertensión).'
            if (value < 90) return '⚠️ Presión sistólica baja (hipotensión).'
            return null

        case 'diastolic':
            if (value >= 120) return '🚨 CRISIS HIPERTENSIVA — consulte urgencias.'
            if (value >= 90) return '⚠️ Diastólica elevada.'
            if (value < 60) return '⚠️ Diastólica baja.'
            return null

        case 'heartRate':
            if (value > 100) return '⚠️ Taquicardia (frecuencia elevada).'
            if (value < 60) return '⚠️ Bradicardia (frecuencia baja).'
            return null

        case 'temperature':
            if (value >= 38.0) return '⚠️ Fiebre.'
            if (value < 36.0) return '⚠️ Hipotermia.'
            return null

        case 'oxygenSat':
            if (value < 90) return '🚨 Saturación crítica — consulte urgencias.'
            if (value < 95) return '⚠️ Saturación baja.'
            return null

        default:
            return null
    }
}

/**
 * Formatea un registro de signos vitales como texto legible para el chat.
 * @param {object} record
 * @param {number} index - número de lista (1-based)
 */
export function formatRecord(record, index) {
    const dt = new Date(record.dateTime).toLocaleString('es-CO')
    const temp = record.temperature != null ? `🌡️ Temp: ${record.temperature} °C` : null
    const o2 = record.oxygenSat != null ? `💨 O₂: ${record.oxygenSat} %` : null

    const lines = [
        `📋 Registro #${index} — ${dt}`,
        `   💉 Presión: ${record.systolic}/${record.diastolic} mmHg`,
        `   ❤️ F.Cardíaca: ${record.heartRate} lpm`,
        temp && `   ${temp}`,
        o2 && `   ${o2}`,
        record.observation ? `   🩺 Obs. médico: "${record.observation}"` : null,
    ]
    return lines.filter(Boolean).join('\n')
}