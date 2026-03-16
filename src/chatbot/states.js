/**
 * states.js
 * ----------
 * Define todos los estados posibles del chatbot.
 * Cada estado representa un punto de la conversación donde el bot
 * espera un tipo específico de entrada del usuario.
 */

export const STATES = {
    // ── Inicio ────────────────────────────────────────────────
    WELCOME: 'WELCOME',           // Bienvenida, pregunta tipo de usuario
    PATIENT_NAME: 'PATIENT_NAME',      // Paciente ingresa su nombre
    DOCTOR_NAME: 'DOCTOR_NAME',       // Médico ingresa su nombre
    DOCTOR_PASSWORD: 'DOCTOR_PASSWORD',   // Médico ingresa contraseña

    // ── Menús ─────────────────────────────────────────────────
    PATIENT_MENU: 'PATIENT_MENU',      // Opciones del paciente
    DOCTOR_MENU: 'DOCTOR_MENU',       // Opciones del médico

    // ── Registro de signos vitales (paciente) ─────────────────
    REG_SYSTOLIC: 'REG_SYSTOLIC',      // Presión sistólica
    REG_DIASTOLIC: 'REG_DIASTOLIC',     // Presión diastólica
    REG_HEART_RATE: 'REG_HEART_RATE',    // Frecuencia cardíaca
    REG_TEMP_ASK: 'REG_TEMP_ASK',      // ¿Registrar temperatura?
    REG_TEMP: 'REG_TEMP',          // Temperatura (opcional)
    REG_OXSAT_ASK: 'REG_OXSAT_ASK',     // ¿Registrar saturación O2?
    REG_OXSAT: 'REG_OXSAT',         // Saturación de oxígeno (opcional)

    // ── Ver / eliminar registros (paciente) ───────────────────
    VIEW_RECORDS: 'VIEW_RECORDS',      // Mostrar registros del paciente
    DELETE_SELECT: 'DELETE_SELECT',     // Seleccionar número de registro a eliminar

    // ── Funciones del médico ───────────────────────────────────
    DOCTOR_PATIENTS: 'DOCTOR_PATIENTS',   // Listar pacientes
    DOCTOR_VIEW_RECORDS: 'DOCTOR_VIEW_RECORDS', // Ver registros de un paciente
    DOCTOR_OBS_SELECT: 'DOCTOR_OBS_SELECT', // Seleccionar registro para observación
    DOCTOR_OBS_WRITE: 'DOCTOR_OBS_WRITE',  // Escribir la observación
}
