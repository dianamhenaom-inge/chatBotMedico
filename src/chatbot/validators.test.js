/**
 * validators.test.js
 * Pruebas unitarias para las funciones de validación de signos vitales.
 */

import { describe, it, expect } from 'vitest'
import { validateNumber, getVitalAlert, formatRecord, RANGES } from './validators.js'

// ── validateNumber ────────────────────────────────────────────────────────────

describe('validateNumber', () => {
    it('acepta un número entero válido', () => {
        const result = validateNumber('120', { min: 70, max: 250, label: 'sistólica' })
        expect(result.valid).toBe(true)
        expect(result.value).toBe(120)
    })

    it('acepta un número decimal con punto', () => {
        const result = validateNumber('36.5', { min: 34, max: 42, label: 'temperatura' })
        expect(result.valid).toBe(true)
        expect(result.value).toBe(36.5)
    })

    it('acepta un número decimal con coma (formato colombiano)', () => {
        const result = validateNumber('36,5', { min: 34, max: 42, label: 'temperatura' })
        expect(result.valid).toBe(true)
        expect(result.value).toBe(36.5)
    })

    it('rechaza texto no numérico', () => {
        const result = validateNumber('abc', { min: 70, max: 250, label: 'sistólica' })
        expect(result.valid).toBe(false)
        expect(result.error).toContain('no es un número válido')
    })

    it('rechaza valor por debajo del mínimo', () => {
        const result = validateNumber('60', { min: 70, max: 250, label: 'sistólica' })
        expect(result.valid).toBe(false)
        expect(result.error).toContain('mínimo')
        expect(result.error).toContain('70')
    })

    it('rechaza valor por encima del máximo', () => {
        const result = validateNumber('260', { min: 70, max: 250, label: 'sistólica' })
        expect(result.valid).toBe(false)
        expect(result.error).toContain('máximo')
        expect(result.error).toContain('250')
    })

    it('acepta el valor exacto del mínimo (borde inferior)', () => {
        const result = validateNumber('70', { min: 70, max: 250, label: 'sistólica' })
        expect(result.valid).toBe(true)
    })

    it('acepta el valor exacto del máximo (borde superior)', () => {
        const result = validateNumber('250', { min: 70, max: 250, label: 'sistólica' })
        expect(result.valid).toBe(true)
    })
})

// ── getVitalAlert — sistólica ─────────────────────────────────────────────────

describe('getVitalAlert - sistólica', () => {
    it('sin alerta para presión normal (110 mmHg)', () => {
        expect(getVitalAlert('systolic', 110)).toBeNull()
    })

    it('alerta pre-hipertensión (120–129 mmHg)', () => {
        expect(getVitalAlert('systolic', 125)).toMatch(/pre-hipertensión/i)
    })

    it('alerta hipertensión estadio 1 (130–139 mmHg)', () => {
        expect(getVitalAlert('systolic', 135)).toMatch(/estadio 1/i)
    })

    it('alerta hipertensión estadio 2 (140–179 mmHg)', () => {
        expect(getVitalAlert('systolic', 150)).toMatch(/estadio 2/i)
    })

    it('alerta crisis hipertensiva (≥ 180 mmHg)', () => {
        expect(getVitalAlert('systolic', 180)).toMatch(/crisis/i)
    })

    it('alerta hipotensión (< 90 mmHg)', () => {
        expect(getVitalAlert('systolic', 85)).toMatch(/hipotensión/i)
    })
})

// ── getVitalAlert — diastólica ────────────────────────────────────────────────

describe('getVitalAlert - diastólica', () => {
    it('sin alerta para presión normal (75 mmHg)', () => {
        expect(getVitalAlert('diastolic', 75)).toBeNull()
    })

    it('alerta diastólica elevada (≥ 90 mmHg)', () => {
        expect(getVitalAlert('diastolic', 95)).toMatch(/elevada/i)
    })

    it('alerta crisis hipertensiva (≥ 120 mmHg)', () => {
        expect(getVitalAlert('diastolic', 120)).toMatch(/crisis/i)
    })

    it('alerta diastólica baja (< 60 mmHg)', () => {
        expect(getVitalAlert('diastolic', 55)).toMatch(/baja/i)
    })
})

// ── getVitalAlert — frecuencia cardíaca ──────────────────────────────────────

describe('getVitalAlert - frecuencia cardíaca', () => {
    it('sin alerta para frecuencia normal (75 lpm)', () => {
        expect(getVitalAlert('heartRate', 75)).toBeNull()
    })

    it('alerta taquicardia (> 100 lpm)', () => {
        expect(getVitalAlert('heartRate', 105)).toMatch(/taquicardia/i)
    })

    it('alerta bradicardia (< 60 lpm)', () => {
        expect(getVitalAlert('heartRate', 55)).toMatch(/bradicardia/i)
    })
})

// ── getVitalAlert — temperatura ───────────────────────────────────────────────

describe('getVitalAlert - temperatura', () => {
    it('sin alerta para temperatura normal (37 °C)', () => {
        expect(getVitalAlert('temperature', 37)).toBeNull()
    })

    it('alerta fiebre (≥ 38 °C)', () => {
        expect(getVitalAlert('temperature', 38)).toMatch(/fiebre/i)
    })

    it('alerta hipotermia (< 36 °C)', () => {
        expect(getVitalAlert('temperature', 35)).toMatch(/hipotermia/i)
    })
})

// ── getVitalAlert — saturación de oxígeno ────────────────────────────────────

describe('getVitalAlert - saturación de oxígeno', () => {
    it('sin alerta para saturación normal (98 %)', () => {
        expect(getVitalAlert('oxygenSat', 98)).toBeNull()
    })

    it('alerta saturación baja (90–94 %)', () => {
        expect(getVitalAlert('oxygenSat', 93)).toMatch(/baja/i)
    })

    it('alerta saturación crítica (< 90 %)', () => {
        expect(getVitalAlert('oxygenSat', 88)).toMatch(/crítica/i)
    })
})

// ── getVitalAlert — tipo desconocido ─────────────────────────────────────────

describe('getVitalAlert - tipo desconocido', () => {
    it('retorna null para un tipo de signo vital no reconocido', () => {
        expect(getVitalAlert('signoInventado', 50)).toBeNull()
    })
})

// ── formatRecord ──────────────────────────────────────────────────────────────

describe('formatRecord', () => {
    const baseRecord = {
        dateTime: '2025-01-15T10:30:00.000Z',
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
        temperature: null,
        oxygenSat: null,
        observation: null,
    }

    it('incluye número de registro en el texto', () => {
        const text = formatRecord(baseRecord, 1)
        expect(text).toContain('Registro #1')
    })

    it('incluye presión arterial formateada', () => {
        const text = formatRecord(baseRecord, 1)
        expect(text).toContain('120/80')
    })

    it('incluye frecuencia cardíaca', () => {
        const text = formatRecord(baseRecord, 1)
        expect(text).toContain('72')
    })

    it('omite temperatura cuando es null', () => {
        const text = formatRecord(baseRecord, 1)
        expect(text).not.toContain('Temp')
    })

    it('incluye temperatura cuando está presente', () => {
        const record = { ...baseRecord, temperature: 36.8 }
        const text = formatRecord(record, 1)
        expect(text).toContain('36.8')
    })

    it('omite saturación de oxígeno cuando es null', () => {
        const text = formatRecord(baseRecord, 1)
        expect(text).not.toContain('O₂')
    })

    it('incluye saturación de oxígeno cuando está presente', () => {
        const record = { ...baseRecord, oxygenSat: 97 }
        const text = formatRecord(record, 1)
        expect(text).toContain('97')
    })

    it('incluye observación médica cuando existe', () => {
        const record = { ...baseRecord, observation: 'Controlar en 24h' }
        const text = formatRecord(record, 1)
        expect(text).toContain('Controlar en 24h')
    })

    it('omite observación cuando es null', () => {
        const text = formatRecord(baseRecord, 1)
        expect(text).not.toContain('Obs. médico')
    })
})

// ── RANGES — sanidad de rangos ────────────────────────────────────────────────

describe('RANGES - integridad de datos', () => {
    it('el mínimo de cada rango es menor que el máximo', () => {
        for (const [key, range] of Object.entries(RANGES)) {
            expect(range.min).toBeLessThan(range.max)
        }
    })

    it('los rangos normales están dentro de los límites aceptados', () => {
        expect(RANGES.systolic.normalMax).toBeLessThanOrEqual(RANGES.systolic.max)
        expect(RANGES.diastolic.normalMax).toBeLessThanOrEqual(RANGES.diastolic.max)
        expect(RANGES.heartRate.normalMin).toBeGreaterThanOrEqual(RANGES.heartRate.min)
        expect(RANGES.heartRate.normalMax).toBeLessThanOrEqual(RANGES.heartRate.max)
    })
})
