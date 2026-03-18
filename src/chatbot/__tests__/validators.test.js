import { describe, it, expect } from 'vitest'
import { validateNumber, getVitalAlert, formatRecord } from '../validators.js'

// ── validateNumber ────────────────────────────────────────────────────────────

describe('validateNumber', () => {
    it('acepta un número válido dentro del rango', () => {
        const r = validateNumber('120', { min: 70, max: 250, label: 'sistólica' })
        expect(r).toEqual({ valid: true, value: 120 })
    })

    it('acepta coma como separador decimal', () => {
        const r = validateNumber('36,5', { min: 34, max: 42, label: 'temperatura' })
        expect(r).toEqual({ valid: true, value: 36.5 })
    })

    it('rechaza texto no numérico', () => {
        const r = validateNumber('abc', { min: 70, max: 250, label: 'sistólica' })
        expect(r.valid).toBe(false)
        expect(r.error).toContain('no es un número válido')
    })

    it('rechaza valor por debajo del mínimo', () => {
        const r = validateNumber('60', { min: 70, max: 250, label: 'sistólica' })
        expect(r.valid).toBe(false)
        expect(r.error).toContain('mínimo')
    })

    it('rechaza valor por encima del máximo', () => {
        const r = validateNumber('300', { min: 70, max: 250, label: 'sistólica' })
        expect(r.valid).toBe(false)
        expect(r.error).toContain('máximo')
    })

    it('acepta los valores en los límites del rango (boundary)', () => {
        expect(validateNumber('70', { min: 70, max: 250, label: 'x' }).valid).toBe(true)
        expect(validateNumber('250', { min: 70, max: 250, label: 'x' }).valid).toBe(true)
    })

    it('rechaza cadena vacía', () => {
        const r = validateNumber('', { min: 0, max: 100, label: 'x' })
        expect(r.valid).toBe(false)
    })
})

// ── getVitalAlert ─────────────────────────────────────────────────────────────

describe('getVitalAlert — sistólica', () => {
    it('normal (90–119): sin alerta', () => {
        expect(getVitalAlert('systolic', 115)).toBeNull()
    })
    it('pre-hipertensión (120–129)', () => {
        expect(getVitalAlert('systolic', 125)).toContain('pre-hipertensión')
    })
    it('hipertensión estadio 1 (130–139)', () => {
        expect(getVitalAlert('systolic', 135)).toContain('estadio 1')
    })
    it('hipertensión estadio 2 (140–179)', () => {
        expect(getVitalAlert('systolic', 145)).toContain('estadio 2')
    })
    it('crisis hipertensiva (≥180)', () => {
        expect(getVitalAlert('systolic', 180)).toContain('CRISIS')
    })
    it('hipotensión (<90)', () => {
        expect(getVitalAlert('systolic', 85)).toContain('hipotensión')
    })
})

describe('getVitalAlert — diastólica', () => {
    it('normal (60–89): sin alerta', () => {
        expect(getVitalAlert('diastolic', 75)).toBeNull()
    })
    it('crisis hipertensiva (≥120)', () => {
        expect(getVitalAlert('diastolic', 125)).toContain('CRISIS')
    })
    it('diastólica elevada (90–119)', () => {
        expect(getVitalAlert('diastolic', 95)).toContain('elevada')
    })
    it('diastólica baja (<60)', () => {
        expect(getVitalAlert('diastolic', 55)).toContain('baja')
    })
})

describe('getVitalAlert — frecuencia cardíaca', () => {
    it('normal (60–100): sin alerta', () => {
        expect(getVitalAlert('heartRate', 80)).toBeNull()
    })
    it('taquicardia (>100)', () => {
        expect(getVitalAlert('heartRate', 105)).toContain('Taquicardia')
    })
    it('bradicardia (<60)', () => {
        expect(getVitalAlert('heartRate', 55)).toContain('Bradicardia')
    })
})

describe('getVitalAlert — temperatura', () => {
    it('normal (36–37.9): sin alerta', () => {
        expect(getVitalAlert('temperature', 37)).toBeNull()
    })
    it('fiebre (≥38)', () => {
        expect(getVitalAlert('temperature', 38.5)).toContain('Fiebre')
    })
    it('hipotermia (<36)', () => {
        expect(getVitalAlert('temperature', 35.5)).toContain('Hipotermia')
    })
})

describe('getVitalAlert — saturación de oxígeno', () => {
    it('normal (≥95): sin alerta', () => {
        expect(getVitalAlert('oxygenSat', 98)).toBeNull()
    })
    it('saturación baja (90–94)', () => {
        expect(getVitalAlert('oxygenSat', 93)).toContain('baja')
    })
    it('saturación crítica (<90)', () => {
        expect(getVitalAlert('oxygenSat', 88)).toContain('crítica')
    })
})

describe('getVitalAlert — tipo desconocido', () => {
    it('retorna null para tipo no reconocido', () => {
        expect(getVitalAlert('glucosa', 100)).toBeNull()
    })
})

// ── formatRecord ──────────────────────────────────────────────────────────────

describe('formatRecord', () => {
    const base = {
        dateTime: new Date('2024-03-15T10:30:00Z').toISOString(),
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
        temperature: null,
        oxygenSat: null,
        observation: null,
    }

    it('incluye número de registro y presión arterial', () => {
        const text = formatRecord(base, 1)
        expect(text).toContain('Registro #1')
        expect(text).toContain('120/80 mmHg')
        expect(text).toContain('72 lpm')
    })

    it('omite temperatura cuando es null', () => {
        const text = formatRecord(base, 1)
        expect(text).not.toContain('°C')
    })

    it('omite saturación de O₂ cuando es null', () => {
        const text = formatRecord(base, 1)
        expect(text).not.toContain('O₂')
    })

    it('incluye temperatura cuando está presente', () => {
        const text = formatRecord({ ...base, temperature: 36.5 }, 2)
        expect(text).toContain('36.5 °C')
    })

    it('incluye O₂ cuando está presente', () => {
        const text = formatRecord({ ...base, oxygenSat: 97 }, 3)
        expect(text).toContain('97 %')
    })

    it('incluye observación médica cuando existe', () => {
        const text = formatRecord({ ...base, observation: 'Paciente estable' }, 4)
        expect(text).toContain('Paciente estable')
    })

    it('omite observación cuando es null', () => {
        const text = formatRecord(base, 1)
        expect(text).not.toContain('Obs. médico')
    })
})
