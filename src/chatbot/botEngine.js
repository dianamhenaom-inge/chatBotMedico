/**
 * botEngine.js
 * ---------------
 * Motor del chatbot implementado como máquina de estados.
 *
 * Patrón: State Machine
 *   - Cada estado define cómo procesar la entrada del usuario.
 *   - process() recibe el input + contexto actual y devuelve:
 *       { messages, nextState, context }
 *   - Los mensajes pueden tener tipo 'bot' | 'bot-alert' | 'bot-success'.
 *
 * Contexto (context):
 *   Objeto mutable que acumula datos a lo largo de la conversación
 *   (e.g., usuario activo, signos vitales en curso, selecciones temporales).
 */


import {STATES} from './states.js'
import {formatRecord, getVitalAlert, RANGES, validateNumber} from './validators.js'

// ── Helpers internos ────────────────────────────────────────────────────────

/** Crea un mensaje de tipo bot */
const msg = (text) => ({type: 'bot', text})
const ok = (text) => ({type: 'bot-success', text})
const warn = (text) => ({type: 'bot-alert', text})
const err = (text) => ({type: 'bot-error', text})

/** Menú del paciente */
const PATIENT_MENU_TEXT = `¿Qué deseas hacer?
  1️⃣  Registrar signos vitales
  2️⃣  Ver mis registros
  3️⃣  Eliminar un registro
  4️⃣  Cerrar sesión`

/** Menú del médico */
const DOCTOR_MENU_TEXT = `¿Qué deseas hacer?
  1️⃣  Ver lista de pacientes
  2️⃣  Ver registros de un paciente
  3️⃣  Agregar observación a un registro
  4️⃣  Cerrar sesión`

// ── Motor principal ─────────────────────────────────────────────────────────

/**
 * Procesa la entrada del usuario según el estado actual.
 *
 * @param {string}   input      - Texto ingresado por el usuario
 * @param {string}   state      - Estado actual del bot (ver STATES)
 * @param {object}   context    - Datos acumulados de la sesión (mutable)
 * @param {object}   store      - API del dataStore
 * @returns {{ messages: array, nextState: string, context: object }}
 */
export function process(input, state, context, store) {
    const trimmed = input.trim()

    switch (state) {

        // ── Bienvenida ──────────────────────────────────────────────────────────
        case STATES.WELCOME: {
            const choice = trimmed
            if (choice === '1') {
                return {
                    messages: [msg('Por favor, ingresa tu nombre completo:')],
                    nextState: STATES.PATIENT_NAME,
                    context,
                }
            }
            if (choice === '2') {
                return {
                    messages: [msg('Ingresa tu nombre (tal como está registrado):')],
                    nextState: STATES.DOCTOR_NAME,
                    context,
                }
            }
            return {
                messages: [err('Opción no válida. Escribe 1 para Paciente o 2 para Médico.')],
                nextState: STATES.WELCOME,
                context,
            }
        }

        // ── Autenticación paciente ──────────────────────────────────────────────
        case STATES.PATIENT_NAME: {
            if (!trimmed) {
                return {messages: [err('El nombre no puede estar vacío.')], nextState: state, context}
            }
            const patient = store.getOrCreatePatient(trimmed)
            return {
                messages: [ok(`¡Hola, ${patient.name}! 👋`), msg(PATIENT_MENU_TEXT)],
                nextState: STATES.PATIENT_MENU,
                context: {...context, currentUser: patient, userType: 'patient'},
            }
        }

        // ── Autenticación médico ────────────────────────────────────────────────
        case STATES.DOCTOR_NAME: {
            if (!trimmed) {
                return {messages: [err('El nombre no puede estar vacío.')], nextState: state, context}
            }
            return {
                messages: [msg('Ingresa tu contraseña:')],
                nextState: STATES.DOCTOR_PASSWORD,
                context: {...context, doctorNameAttempt: trimmed},
            }
        }

        case STATES.DOCTOR_PASSWORD: {
            const doctor = store.findDoctor(context.doctorNameAttempt, trimmed)
            if (!doctor) {
                return {
                    messages: [err('Nombre o contraseña incorrectos. Intenta de nuevo.'), msg('Ingresa tu nombre:')],
                    nextState: STATES.DOCTOR_NAME,
                    context: {...context, doctorNameAttempt: undefined},
                }
            }
            return {
                messages: [ok(`¡Bienvenido, ${doctor.name}! 🩺`), msg(DOCTOR_MENU_TEXT)],
                nextState: STATES.DOCTOR_MENU,
                context: {...context, currentUser: doctor, userType: 'doctor'},
            }
        }

        // ── Menú paciente ───────────────────────────────────────────────────────
        case STATES.PATIENT_MENU: {
            if (trimmed === '1') {
                return {
                    messages: [
                        msg('Iniciemos el registro de signos vitales.'),
                        msg('📍 Ingresa la PRESIÓN SISTÓLICA (número mayor, en mmHg)\n   Rango aceptado: 70–250'),
                    ],
                    nextState: STATES.REG_SYSTOLIC,
                    context: {...context, vitals: {}},
                }
            }
            if (trimmed === '2') {
                return handleViewRecords(context, store)
            }
            if (trimmed === '3') {
                return handleDeleteInit(context, store)
            }
            if (trimmed === '4') {
                return handleLogout()
            }
            return {
                messages: [err('Opción inválida. Escribe 1, 2, 3 o 4.'), msg(PATIENT_MENU_TEXT)],
                nextState: STATES.PATIENT_MENU,
                context,
            }
        }

        // ── Registro de signos vitales ──────────────────────────────────────────
        case STATES.REG_SYSTOLIC: {
            const result = validateNumber(trimmed, {...RANGES.systolic, label: 'presión sistólica'})
            if (!result.valid) return {messages: [err(result.error)], nextState: state, context}

            const alert = getVitalAlert('systolic', result.value)
            const msgs = alert ? [warn(alert)] : []
            return {
                messages: [...msgs, msg('📍 Ingresa la PRESIÓN DIASTÓLICA (número menor, en mmHg)\n   Rango aceptado: 40–150')],
                nextState: STATES.REG_DIASTOLIC,
                context: {...context, vitals: {...context.vitals, systolic: result.value}},
            }
        }

        case STATES.REG_DIASTOLIC: {
            const result = validateNumber(trimmed, {...RANGES.diastolic, label: 'presión diastólica'})
            if (!result.valid) return {messages: [err(result.error)], nextState: state, context}

            if (result.value >= context.vitals.systolic) {
                return {
                    messages: [err('La diastólica debe ser menor que la sistólica. Intenta de nuevo.')],
                    nextState: state,
                    context,
                }
            }
            const alert = getVitalAlert('diastolic', result.value)
            const msgs = alert ? [warn(alert)] : []
            return {}
        }

        case STATES.REG_HEART_RATE: {
            const result = validateNumber(trimmed, {...RANGES.heartRate, label: 'frecuencia cardíaca'})
            if (!result.valid) return {messages: [err(result.error)], nextState: state, context}

            const alert = getVitalAlert('heartRate', result.value)
            const msgs = alert ? [warn(alert)] : []
            return {
                messages: [...msgs, msg('¿Deseas registrar la TEMPERATURA? (s/n)')],
                nextState: STATES.REG_TEMP_ASK,
                context: {...context, vitals: {...context.vitals, heartRate: result.value}},
            }
        }

        case STATES.REG_TEMP_ASK: {
            if (trimmed.toLowerCase() === 's') {
                return {
                    messages: [msg('📍 Ingresa la TEMPERATURA corporal (°C)\n   Rango aceptado: 34–42')],
                    nextState: STATES.REG_TEMP,
                    context,
                }
            }
            return {
                messages: [msg('¿Deseas registrar la SATURACIÓN DE OXÍGENO? (s/n)')],
                nextState: STATES.REG_OXSAT_ASK,
                context,
            }
        }

        case STATES.REG_TEMP: {
            const result = validateNumber(trimmed, {...RANGES.temperature, label: 'temperatura'})
            if (!result.valid) return {messages: [err(result.error)], nextState: state, context}

            const alert = getVitalAlert('temperature', result.value)
            const msgs = alert ? [warn(alert)] : []
            return {
                messages: [...msgs, msg('¿Deseas registrar la SATURACIÓN DE OXÍGENO? (s/n)')],
                nextState: STATES.REG_OXSAT_ASK,
                context: {...context, vitals: {...context.vitals, temperature: result.value}},
            }
        }

        case STATES.REG_OXSAT_ASK: {
            if (trimmed.toLowerCase() === 's') {
                return {
                    messages: [msg('📍 Ingresa la SATURACIÓN DE OXÍGENO (%)\n   Rango aceptado: 50–100')],
                    nextState: STATES.REG_OXSAT,
                    context,
                }
            }
            return saveVitalRecord(context, store)
        }

        case STATES.REG_OXSAT: {
            const result = validateNumber(trimmed, {...RANGES.oxygenSat, label: 'saturación de oxígeno'})
            if (!result.valid) return {messages: [err(result.error)], nextState: state, context}

            const alert = getVitalAlert('oxygenSat', result.value)
            const msgs = alert ? [warn(alert)] : []
            const newCtx = {...context, vitals: {...context.vitals, oxygenSat: result.value}}
            const saved = saveVitalRecord(newCtx, store)
            return {...saved, messages: [...msgs, ...saved.messages]}
        }

        // ── Ver registros (paciente) ────────────────────────────────────────────
        case STATES.VIEW_RECORDS: {
            // Cualquier respuesta regresa al menú
            return {messages: [msg(PATIENT_MENU_TEXT)], nextState: STATES.PATIENT_MENU, context}
        }

        // ── Eliminar registro ───────────────────────────────────────────────────
        case STATES.DELETE_SELECT: {
            const records = store.getRecordsByPatient(context.currentUser.id)

            if (trimmed.toLowerCase() === 'cancelar') {
                return {
                    messages: [msg('Eliminación cancelada.'), msg(PATIENT_MENU_TEXT)],
                    nextState: STATES.PATIENT_MENU,
                    context
                }
            }

            const idx = parseInt(trimmed, 10) - 1
            if (isNaN(idx) || idx < 0 || idx >= records.length) {
                return {
                    messages: [err(`Número inválido. Escribe un número entre 1 y ${records.length}, o "cancelar".`)],
                    nextState: state,
                    context
                }
            }

            const record = records[idx]
            store.deleteRecord(record.id)
            return {
                messages: [ok('✅ Registro eliminado correctamente.'), msg(PATIENT_MENU_TEXT)],
                nextState: STATES.PATIENT_MENU,
                context,
            }
        }

        // ── Menú médico ─────────────────────────────────────────────────────────
        case STATES.DOCTOR_MENU: {
            if (trimmed === '1') return handleDoctorListPatients(store, context)
            if (trimmed === '2') return handleDoctorSelectPatient(store, context)
            if (trimmed === '3') return handleDoctorSelectPatientForObs(store, context)
            if (trimmed === '4') return handleLogout()
            return {
                messages: [err('Opción inválida. Escribe 1, 2, 3 o 4.'), msg(DOCTOR_MENU_TEXT)],
                nextState: STATES.DOCTOR_MENU,
                context,
            }
        }

        // ── Ver registros de un paciente (médico) ───────────────────────────────
        case STATES.DOCTOR_PATIENTS: {
            return handleDoctorViewPatientRecords(trimmed, store, context)
        }

        case STATES.DOCTOR_VIEW_RECORDS: {
            return {messages: [msg(DOCTOR_MENU_TEXT)], nextState: STATES.DOCTOR_MENU, context}
        }

        // ── Selección de paciente para observación ──────────────────────────────
        case STATES.DOCTOR_OBS_SELECT: {
            const patients = store.getPatients()
            const idx = parseInt(trimmed, 10) - 1
            if (isNaN(idx) || idx < 0 || idx >= patients.length) {
                return {messages: [err(`Número inválido.`)], nextState: state, context}
            }
            const patient = patients[idx]
            const records = store.getRecordsByPatient(patient.id)
            if (!records.length) {
                return {
                    messages: [msg(`${patient.name} no tiene registros aún.`), msg(DOCTOR_MENU_TEXT)],
                    nextState: STATES.DOCTOR_MENU,
                    context,
                }
            }
            const lines = records.map((r, i) => formatRecord(r, i + 1)).join('\n\n')
            return {
                messages: [
                    msg(`📋 Registros de ${patient.name}:\n\n${lines}`),
                    msg(`¿A qué registro deseas agregar observación? (1–${records.length})`),
                ],
                nextState: STATES.DOCTOR_OBS_WRITE,
                context: {...context, obsPatient: patient, obsRecords: records},
            }
        }

        // ── Escribir observación ────────────────────────────────────────────────
        case STATES.DOCTOR_OBS_WRITE: {
            // Primera entrada: selección del registro
            if (!context.obsRecordSelected) {
                const idx = parseInt(trimmed, 10) - 1
                if (isNaN(idx) || idx < 0 || idx >= context.obsRecords.length) {
                    return {
                        messages: [err(`Número inválido. Escribe entre 1 y ${context.obsRecords.length}.`)],
                        nextState: state,
                        context,
                    }
                }
                return {
                    messages: [msg('✏️ Escribe la observación para este registro:')],
                    nextState: STATES.DOCTOR_OBS_WRITE,
                    context: {...context, obsRecordSelected: context.obsRecords[idx]},
                }
            }

            // Segunda entrada: texto de la observación
            if (!trimmed) {
                return {messages: [err('La observación no puede estar vacía.')], nextState: state, context}
            }
            store.addObservation(context.obsRecordSelected.id, trimmed)
            return {
                messages: [ok('✅ Observación guardada correctamente.'), msg(DOCTOR_MENU_TEXT)],
                nextState: STATES.DOCTOR_MENU,
                context: {...context, obsPatient: undefined, obsRecords: undefined, obsRecordSelected: undefined},
            }
        }

        default:
            return {messages: [err('Estado desconocido. Reiniciando...')], nextState: STATES.WELCOME, context: {}}
    }
}

// ── Mensaje de bienvenida inicial ───────────────────────────────────────────
export function getWelcomeMessages() {
    return [
        msg('👋 Bienvenido al ChatBot de Monitoreo de Hipertensión'),
        msg('¿Quién eres?\n  1️⃣  Paciente\n  2️⃣  Médico'),
    ]
}

// ── Handlers auxiliares ─────────────────────────────────────────────────────

function saveVitalRecord(context, store) {
    const record = store.addRecord(context.currentUser.id, {
        ...context.vitals,
        dateTime: new Date().toISOString(),
    })
    return {
        messages: [ok('✅ Signos vitales registrados exitosamente.'), msg(PATIENT_MENU_TEXT)],
        nextState: STATES.PATIENT_MENU,
        context: {...context, vitals: undefined},
    }
}

function handleViewRecords(context, store) {
    const records = store.getRecordsByPatient(context.currentUser.id)
    if (!records.length) {
        return {
            messages: [msg('No tienes registros aún.'), msg(PATIENT_MENU_TEXT)],
            nextState: STATES.PATIENT_MENU,
            context,
        }
    }
    const lines = records.map((r, i) => formatRecord(r, i + 1)).join('\n\n')
    return {
        messages: [msg(`📋 Tus registros:\n\n${lines}`), msg('Escribe cualquier tecla para continuar.')],
        nextState: STATES.VIEW_RECORDS,
        context,
    }
}

function handleDeleteInit(context, store) {
    const records = store.getRecordsByPatient(context.currentUser.id)
    if (!records.length) {
        return {
            messages: [msg('No tienes registros para eliminar.'), msg(PATIENT_MENU_TEXT)],
            nextState: STATES.PATIENT_MENU,
            context,
        }
    }
    const lines = records.map((r, i) => formatRecord(r, i + 1)).join('\n\n')
    return {
        messages: [
            msg(`📋 Tus registros:\n\n${lines}`),
            msg(`¿Cuál registro deseas eliminar? (1–${records.length})\nEscribe "cancelar" para cancelar.`),
        ],
        nextState: STATES.DELETE_SELECT,
        context,
    }
}

function handleDoctorListPatients(store, context) {
    const patients = store.getPatients()
    if (!patients.length) {
        return {
            messages: [msg('No hay pacientes registrados aún.'), msg(DOCTOR_MENU_TEXT)],
            nextState: STATES.DOCTOR_MENU,
            context,
        }
    }
    const lines = patients.map((p, i) => `  ${i + 1}. ${p.name}`).join('\n')
    return {
        messages: [msg(`👥 Pacientes registrados:\n${lines}`), msg(DOCTOR_MENU_TEXT)],
        nextState: STATES.DOCTOR_MENU,
        context,
    }
}

function handleDoctorSelectPatient(store, context) {
    const patients = store.getPatients()
    if (!patients.length) {
        return {
            messages: [msg('No hay pacientes registrados.'), msg(DOCTOR_MENU_TEXT)],
            nextState: STATES.DOCTOR_MENU,
            context,
        }
    }
    const lines = patients.map((p, i) => `  ${i + 1}. ${p.name}`).join('\n')
    return {
        messages: [msg(`👥 Selecciona un paciente:\n${lines}`)],
        nextState: STATES.DOCTOR_PATIENTS,
        context,
    }
}

function handleDoctorViewPatientRecords(trimmed, store, context) {
    const patients = store.getPatients()
    const idx = parseInt(trimmed, 10) - 1
    if (isNaN(idx) || idx < 0 || idx >= patients.length) {
        return {messages: [err('Número inválido.')], nextState: STATES.DOCTOR_PATIENTS, context}
    }
    const patient = patients[idx]
    const records = store.getRecordsByPatient(patient.id)
    if (!records.length) {
        return {
            messages: [msg(`${patient.name} no tiene registros aún.`), msg(DOCTOR_MENU_TEXT)],
            nextState: STATES.DOCTOR_MENU,
            context,
        }
    }
    const lines = records.map((r, i) => formatRecord(r, i + 1)).join('\n\n')
    return {
        messages: [
            msg(`📋 Registros de ${patient.name}:\n\n${lines}`),
            msg('Escribe cualquier tecla para continuar.'),
        ],
        nextState: STATES.DOCTOR_VIEW_RECORDS,
        context,
    }
}

function handleDoctorSelectPatientForObs(store, context) {
    const patients = store.getPatients()
    if (!patients.length) {
        return {
            messages: [msg('No hay pacientes registrados.'), msg(DOCTOR_MENU_TEXT)],
            nextState: STATES.DOCTOR_MENU,
            context,
        }
    }
    const lines = patients.map((p, i) => `  ${i + 1}. ${p.name}`).join('\n')
    return {
        messages: [msg(`👥 Selecciona el paciente cuyo registro quieres anotar:\n${lines}`)],
        nextState: STATES.DOCTOR_OBS_SELECT,
        context,
    }
}

function handleLogout() {
    return {
        messages: [
            msg('Sesión cerrada. ¡Hasta pronto! 👋'),
            msg('¿Quién eres?\n  1️⃣  Paciente\n  2️⃣  Médico'),
        ],
        nextState: STATES.WELCOME,
        context: {},
    }
}
