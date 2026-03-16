/**
 * botEngine.js
 * ---------------
 * Motor del chatbot implementado como máquina de estados (State Machine).
 *
 * Flujo:
 *   1. El usuario envía un mensaje
 *   2. process() evalúa el estado actual + el input
 *   3. Devuelve { messages, nextState, context }
 *   4. ChatWindow actualiza el estado y muestra los mensajes
 *
 *  Contexto (context):
 *  Objeto mutable que acumula datos a lo largo de la conversación
 *  (e.g., usuario activo, signos vitales en curso, selecciones temporales).
 *
 *
 * @param {string} input      - Texto ingresado por el usuario
 * @param {string} state      - Estado actual (ver states.js)
 * @param {object} context    - Datos acumulados de la sesión
 * @param {object} store      - API del dataStore
 */

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

export function process(input, state, context, store) {
    const trimmed = input.trim()

    switch (state) {

        // ── Bienvenida ─────────────────────────────────
        case STATES.WELCOME: {
            return {
                messages: [msg('Por favor, ingresa tu nombre completo:')],
                nextState: STATES.PATIENT_NAME,
                context,
            }
        }

        // ── Autenticación paciente ─────────────────────
        case STATES.PATIENT_NAME: {
            if (!trimmed) {
                return {messages: [err('El nombre no puede estar vacío.')], nextState: state, context}
            }

            const patient = store.getOrCreatePatient(trimmed)

            return {
                messages: [
                    ok(`¡Hola, ${patient.name}! 👋`),
                    msg(PATIENT_MENU_TEXT)
                ],
                nextState: STATES.PATIENT_MENU,
                context: {...context, currentUser: patient, userType: 'patient'},
            }
        }

        // ── Menú paciente ──────────────────────────────
        case STATES.PATIENT_MENU: {

            if (trimmed === '1') {
                return {
                    messages: [
                        msg('Iniciemos el registro de signos vitales.'),
                        msg('📍 Ingresa la PRESIÓN SISTÓLICA (mmHg) 70–250'),
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
                messages: [
                    err('Opción inválida. Escribe 1, 2, 3 o 4.'),
                    msg(PATIENT_MENU_TEXT)
                ],
                nextState: STATES.PATIENT_MENU,
                context,
            }
        }

        // ── Registro presión sistólica ─────────────────
        case STATES.REG_SYSTOLIC: {

            const result = validateNumber(trimmed, {...RANGES.systolic, label: 'presión sistólica'})

            if (!result.valid)
                return {messages: [err(result.error)], nextState: state, context}

            const alert = getVitalAlert('systolic', result.value)

            return {
                messages: [
                    ...(alert ? [warn(alert)] : []),
                    msg('📍 Ingresa la PRESIÓN DIASTÓLICA (mmHg) 40–150')
                ],
                nextState: STATES.REG_DIASTOLIC,
                context: {...context, vitals: {...context.vitals, systolic: result.value}},
            }
        }

        // ── Registro presión diastólica ────────────────
        case STATES.REG_DIASTOLIC: {

            const result = validateNumber(trimmed, {...RANGES.diastolic, label: 'presión diastólica'})

            if (!result.valid)
                return {messages: [err(result.error)], nextState: state, context}

            if (result.value >= context.vitals.systolic) {
                return {
                    messages: [err('La diastólica debe ser menor que la sistólica.')],
                    nextState: state,
                    context,
                }
            }

            const alert = getVitalAlert('diastolic', result.value)

            return {
                messages: [
                    ...(alert ? [warn(alert)] : []),
                    msg('📍 Ingresa la FRECUENCIA CARDÍACA (lpm)')
                ],
                nextState: STATES.REG_HEART_RATE,
                context: {...context, vitals: {...context.vitals, diastolic: result.value}},
            }
        }

        // ── Registro frecuencia cardiaca ───────────────
        case STATES.REG_HEART_RATE: {

            const result = validateNumber(trimmed, {...RANGES.heartRate, label: 'frecuencia cardíaca'})

            if (!result.valid)
                return {messages: [err(result.error)], nextState: state, context}

            const alert = getVitalAlert('heartRate', result.value)

            return {
                messages: [
                    ...(alert ? [warn(alert)] : []),
                    msg('¿Deseas registrar la TEMPERATURA? (s/n)')
                ],
                nextState: STATES.REG_TEMP_ASK,
                context: {...context, vitals: {...context.vitals, heartRate: result.value}},
            }
        }

        // ── Preguntar temperatura ──────────────────────
        case STATES.REG_TEMP_ASK: {

            if (trimmed.toLowerCase() === 's') {
                return {
                    messages: [msg('Ingresa la TEMPERATURA corporal (°C)')],
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

        // ── Registrar temperatura ──────────────────────
        case STATES.REG_TEMP: {

            const result = validateNumber(trimmed, {...RANGES.temperature, label: 'temperatura'})

            if (!result.valid)
                return {messages: [err(result.error)], nextState: state, context}

            const alert = getVitalAlert('temperature', result.value)

            return {
                messages: [
                    ...(alert ? [warn(alert)] : []),
                    msg('¿Deseas registrar la SATURACIÓN DE OXÍGENO? (s/n)')
                ],
                nextState: STATES.REG_OXSAT_ASK,
                context: {...context, vitals: {...context.vitals, temperature: result.value}},
            }
        }

        // ── Preguntar saturación ───────────────────────
        case STATES.REG_OXSAT_ASK: {

            if (trimmed.toLowerCase() === 's') {
                return {
                    messages: [msg('Ingresa la SATURACIÓN DE OXÍGENO (%)')],
                    nextState: STATES.REG_OXSAT,
                    context,
                }
            }

            return saveVitalRecord(context, store)
        }

        // ── Registrar saturación ───────────────────────
        case STATES.REG_OXSAT: {

            const result = validateNumber(trimmed, {...RANGES.oxygenSat, label: 'saturación de oxígeno'})

            if (!result.valid)
                return {messages: [err(result.error)], nextState: state, context}

            const newCtx = {...context, vitals: {...context.vitals, oxygenSat: result.value}}

            return saveVitalRecord(newCtx, store)
        }

        // ── Ver registros ──────────────────────────────
        case STATES.VIEW_RECORDS: {
            return {
                messages: [msg(PATIENT_MENU_TEXT)],
                nextState: STATES.PATIENT_MENU,
                context
            }
        }

        // ── Eliminar registro ──────────────────────────
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
                    messages: [err(`Número inválido.`)],
                    nextState: state,
                    context
                }
            }

            const record = records[idx]

            store.deleteRecord(record.id)

            return {
                messages: [
                    ok('Registro eliminado correctamente.'),
                    msg(PATIENT_MENU_TEXT)
                ],
                nextState: STATES.PATIENT_MENU,
                context
            }
        }

        default:
            return {
                messages: [err('Estado desconocido. Reiniciando...')],
                nextState: STATES.WELCOME,
                context: {}
            }
    }
}


/**
 * Devuelve los mensajes iniciales de bienvenida al abrir el chat.
 * @returns {Array<{ type: string, text: string }>}
 */
// ── Mensaje de bienvenida inicial ───────────────────────────────────────────
export function getWelcomeMessages() {
    return [
        msg('👋 Bienvenido al ChatBot de Monitoreo de Hipertensión'),
        msg('¿Quién eres?\n  1️⃣  Paciente\n  2️⃣  Médico'),
    ]
}


/**
 * Guarda un registro de signos vitales del paciente en el store.
 *
 * Toma los valores de signos vitales almacenados temporalmente en el contexto
 * de la conversación y los persiste asociados al paciente actual.
 * Luego devuelve al usuario al menú principal del paciente.
 *
 * @param {Object} context - Contexto actual de la conversación.
 * @param {Object} context.currentUser - Paciente autenticado.
 * @param {Object} context.vitals - Signos vitales registrados durante la conversación.
 * @param {Object} store - Almacenamiento de datos del sistema.
 * @returns {Object} Respuesta del motor del chatbot con mensajes y siguiente estado.
 */
function saveVitalRecord(context, store) {
    const record = store.addRecord(context.currentUser.id, {
        ...context.vitals
    })

    return {
        messages: [
            ok('✅ Signos vitales registrados exitosamente.'),
            msg(PATIENT_MENU_TEXT)
        ],
        nextState: STATES.PATIENT_MENU,
        context: {...context, vitals: undefined},
    }
}

/**
 * Cierra la sesión actual del usuario.
 *
 * Reinicia el contexto de conversación y vuelve al estado inicial
 * solicitando nuevamente el nombre del paciente.
 *
 * @returns {Object} Respuesta del chatbot reiniciando la conversación.
 */
function handleLogout() {
    return {
        messages: [
            msg('Sesión cerrada. ¡Hasta pronto! 👋'),
            msg('Por favor, ingresa tu nombre completo:')
        ],
        nextState: STATES.WELCOME,
        context: {},
    }
}
