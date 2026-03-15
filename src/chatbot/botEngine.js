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
 * @param {string} input      - Texto ingresado por el usuario
 * @param {string} state      - Estado actual (ver states.js)
 * @param {object} context    - Datos acumulados de la sesión
 * @param {object} store      - API del dataStore
 */

import { STATES } from './states.js'

export function process(input, state, context, store) {
  // TODO: implementar la máquina de estados
  // switch (state) {
  //   case STATES.WELCOME: ...
  //   case STATES.PATIENT_MENU: ...
  //   ...
  // }
}

/**
 * Devuelve los mensajes iniciales de bienvenida al abrir el chat.
 * @returns {Array<{ type: string, text: string }>}
 */
export function getWelcomeMessages() {
  // TODO: retornar mensajes de bienvenida
  return []
}
