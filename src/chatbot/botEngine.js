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

}

/**
 * Devuelve los mensajes iniciales de bienvenida al abrir el chat.
 * @returns {Array<{ type: string, text: string }>}
 */
export function getWelcomeMessages() {

    return []
}
