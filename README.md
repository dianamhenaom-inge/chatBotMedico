# ChatBot Médico — Monitoreo de Hipertensión

Chatbot conversacional para el registro y consulta de signos vitales en pacientes con hipertensión.
Desarrollado como proyecto de la asignatura **Procesos de Desarrollo de Software** (2026-1).

---

## Equipo de desarrollo

| Integrante | Rol |
|---|---|
| Ernesto Guevara Navarro | Desarrollador / QA |
| Diana Marcela Henao Montoya | Desarrolladora / Scrum Master |
| John Harold Morales Vélez | Desarrollador / Arquitecto |

---

## Descripción

El sistema permite a **pacientes hipertensos** registrar sus signos vitales de forma frecuente y a sus **médicos tratantes** consultarlos fácilmente. Funciona como un chatbot de conversación por texto, implementado como una máquina de estados.

### Funcionalidades

**Paciente:**
- Registrar presión arterial (sistólica y diastólica), frecuencia cardíaca, temperatura (opcional) y saturación de oxígeno (opcional)
- Consultar historial de registros con alertas clínicas
- Eliminar registros incorrectos

**Médico:**
- Listar pacientes registrados
- Consultar los registros de signos vitales de cada paciente
- Agregar observaciones médicas a registros específicos

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Vue 3 | ^3.4.0 | Framework frontend (componentes reactivos) |
| Vite | ^4.5.3 | Build tool y servidor de desarrollo |
| Vitest | ^4.1.0 | Framework de pruebas unitarias |
| JavaScript (ES6+) | — | Lógica de negocio |
| localStorage | — | Persistencia de datos en el navegador |

---

## Arquitectura

```
src/
├── chatbot/
│   ├── botEngine.js      # Motor de estados — lógica central del chatbot
│   ├── states.js         # Constantes de todos los estados posibles
│   └── validators.js     # Validación de rangos y alertas clínicas
├── components/
│   ├── ChatWindow.vue    # Contenedor principal del chat
│   ├── ChatInput.vue     # Barra de entrada del usuario
│   └── MessageBubble.vue # Burbuja de mensaje individual
└── store/
    └── dataStore.js      # Capa de datos (localStorage)
```

El bot implementa el patrón **State Machine**: cada estado define cómo procesar la entrada del usuario y a qué estado transicionar. La función `process(input, state, context, store)` es el núcleo del sistema.

---

## Proceso de desarrollo

Se aplicó un **mini-proceso ágil** que incluye:

- **Planeación:** tablero Kanban en GitHub Projects con columnas: Product Backlog → To Do → In Progress → Testing → Done
- **IA controlada:** Claude Code como asistente de codificación y revisión
- **Refactorización:** branch dedicado `feature/refactorizacion-y-pruebas` con mejoras aplicadas al código
- **Práctica ágil adicional:** revisión de código mediante Pull Requests antes de integrar a `develop`

### Diagrama BPMN

Ver archivo: [`docs/diagrama-bpmn.svg`](docs/diagrama-bpmn.svg)

### Flujo conversacional

Ver archivo: [`docs/diagrama-flujo-conversacional.svg`](docs/diagrama-flujo-conversacional.svg)

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage

# Build de producción
npm run build
```

---

## Pruebas unitarias

Suite completa con **104 pruebas** distribuidas en 3 archivos:

| Archivo | Tests | Descripción |
|---|---|---|
| `src/chatbot/validators.test.js` | 30 | Validación de rangos, alertas clínicas, formateo de registros |
| `src/store/dataStore.test.js` | 26 | CRUD de pacientes, médicos y registros |
| `src/chatbot/botEngine.test.js` | 48 | Transiciones de estado: flujo paciente y médico completo |
| **Total** | **104** | **✅ 100% pasadas** |

```
 Test Files  3 passed (3)
      Tests  104 passed (104)
   Duration  ~613ms
```

---

## Rangos clínicos de referencia (OMS / ACC / AHA)

| Signo vital | Rango aceptado | Normal |
|---|---|---|
| Presión sistólica | 70–250 mmHg | < 120 mmHg |
| Presión diastólica | 40–150 mmHg | < 80 mmHg |
| Frecuencia cardíaca | 30–220 lpm | 60–100 lpm |
| Temperatura | 34–42 °C | 36–37.5 °C |
| Saturación O₂ | 50–100 % | ≥ 95 % |

---

## Médicos preconfigurados

| Nombre | Contraseña |
|---|---|
| Dr. García | 1234 |
| Dra. Martínez | 5678 |

---

## Repositorio

[https://github.com/dianamhenaom-inge/chatBotMedico](https://github.com/dianamhenaom-inge/chatBotMedico)
