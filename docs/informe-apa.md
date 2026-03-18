# Desarrollo de un Chatbot para el Monitoreo de Signos Vitales en Pacientes con Hipertensión: Aplicación de un Mini-Proceso de Desarrollo de Software

**Guevara Navarro, Ernesto; Henao Montoya, Diana Marcela; Morales Vélez, John Harold**

Universidad —, Programa de Posgrado en Gestión de Proyectos

Procesos de Desarrollo de Software — 2026-1

---

## Resumen

Este artículo describe el proceso de desarrollo y los resultados obtenidos en la construcción de un chatbot conversacional orientado al monitoreo de signos vitales en pacientes con diagnóstico de hipertensión arterial. El sistema permite a los pacientes registrar sus signos vitales (presión arterial, frecuencia cardíaca, temperatura y saturación de oxígeno) en cualquier momento, y a los médicos tratantes consultar dichos registros y agregar observaciones clínicas. El proceso de desarrollo siguió un mini-proceso ágil estructurado en cinco fases: planeación, análisis, diseño, codificación y pruebas; apoyado en el uso controlado de inteligencia artificial (IA), la práctica de *code review* mediante *pull requests* como práctica ágil adicional, y la refactorización sistemática del código. Se implementaron 104 pruebas unitarias automatizadas con una tasa de aprobación del 100 %. Los resultados evidencian que la integración de IA en el proceso de desarrollo, combinada con prácticas ágiles de revisión de código y pruebas automatizadas, mejora significativamente la calidad del producto y la trazabilidad del proceso.

**Palabras clave:** chatbot médico, hipertensión, signos vitales, proceso ágil, pruebas unitarias, refactorización, inteligencia artificial.

---

## 1. Introducción

La hipertensión arterial es una de las enfermedades crónicas más prevalentes a nivel mundial, con impactos significativos en la calidad de vida de los pacientes y en los sistemas de salud (OMS, 2023). El monitoreo frecuente de los signos vitales es fundamental para el control efectivo de esta patología, sin embargo, los mecanismos tradicionales de registro presentan barreras de acceso y uso. Los chatbots conversacionales emergen como una alternativa tecnológica accesible para facilitar este registro de manera autónoma por parte del paciente (Laranjo et al., 2018).

En este contexto, el presente proyecto tiene como objetivo desarrollar un chatbot que permita a pacientes hipertensos registrar sus signos vitales de forma frecuente y estructurada, y que permita a los médicos tratantes consultar dicha información de manera ágil. El sistema debía desarrollarse siguiendo un proceso de software formal que incluyera el uso de IA, refactorización y una práctica ágil adicional.

---

## 2. Marco teórico

### 2.1 Procesos de desarrollo de software

Un proceso de desarrollo de software define el conjunto de actividades, métodos y prácticas que guían la construcción de un sistema de software. Los enfoques ágiles se caracterizan por la entrega incremental, la colaboración continua y la adaptación al cambio (Beck et al., 2001). Para equipos pequeños, un *mini-proceso* que integre las fases esenciales (planeación, análisis, diseño, codificación y pruebas) con prácticas ágiles resulta especialmente apropiado.

### 2.2 Refactorización

La refactorización consiste en restructurar el código existente sin alterar su comportamiento observable externo, con el objetivo de mejorar su legibilidad, reducir la deuda técnica y facilitar el mantenimiento (Fowler, 2018). Es una práctica fundamental en el desarrollo ágil para asegurar que el código evolucione con calidad sostenida.

### 2.3 Code Review mediante Pull Requests

El *code review* (revisión de código) es una práctica ágil que consiste en que otro miembro del equipo revisa el código antes de integrarlo a la rama principal. En GitHub, esto se implementa mediante *pull requests*, que permiten la discusión, aprobación y trazabilidad de cada integración (Rigby & Bird, 2013). Esta práctica reduce defectos, mejora la consistencia del código y facilita la transferencia de conocimiento.

### 2.4 Uso de IA en el desarrollo de software

La integración de herramientas de IA generativa (como Claude, Copilot o ChatGPT) en el ciclo de desarrollo permite acelerar la codificación, sugerir mejoras de diseño y asistir en la generación de pruebas (Chen et al., 2021). El uso *controlado* implica que el equipo revisa, valida y adapta las sugerencias de la IA, manteniendo la responsabilidad técnica y la coherencia del sistema.

### 2.5 Pruebas unitarias con Vitest

Vitest es un framework de pruebas unitarias de alto rendimiento, diseñado para proyectos construidos con Vite (Vitest, 2024). Permite definir suites de pruebas aisladas que validan el comportamiento de funciones individuales, garantizando la correctud de la lógica de negocio independientemente de la interfaz de usuario.

---

## 3. Proceso de desarrollo definido

### 3.1 Equipo y roles

El equipo estuvo conformado por tres integrantes con los siguientes roles:

| Integrante | Rol principal |
|---|---|
| Ernesto Guevara Navarro | Desarrollador / QA (pruebas unitarias y refactorización) |
| Diana Marcela Henao Montoya | Desarrolladora / Scrum Master (gestión del tablero Kanban y PR) |
| John Harold Morales Vélez | Desarrollador / Arquitecto (diseño de la arquitectura y estados) |

### 3.2 Fases del proceso

El proceso se modeló mediante un diagrama BPMN (ver Figura 1) con cuatro carriles (*lanes*): Equipo de Desarrollo, IA (Claude), QA/Pruebas y Repositorio GitHub. Las fases son:

**Fase 1 — Planeación:** Definición del Product Backlog con 15 ítems priorizados en un tablero Kanban de GitHub Projects (columnas: Product Backlog, To Do, In Progress, Testing, Done). La IA asistió en la sugerencia del stack tecnológico.

**Fase 2 — Análisis y Diseño:** Diseño de la arquitectura del sistema (máquina de estados), el modelo de datos y el flujo conversacional. La IA propuso el diagrama de estados inicial, que fue revisado y ajustado por el equipo.

**Fase 3 — Codificación (Feature Branches):** Cada funcionalidad se desarrolló en una rama independiente (`feature/*`) siguiendo la convención de *Git Flow* simplificado. La IA asistió en la implementación y revisó el código generado. Los commits se realizaron con mensajes descriptivos en formato convencional (`feat:`, `docs:`, etc.).

**Fase 4 — Refactorización:** Se creó una rama dedicada (`feature/refactorizacion-y-pruebas`) para aplicar mejoras al código sin alterar funcionalidad. Las mejoras aplicadas se describen en la Sección 5.

**Fase 5 — Pruebas:** Se implementó una suite completa de pruebas unitarias automatizadas (ver Sección 6). Los resultados de las pruebas se documentaron como evidencia del entregable.

### 3.3 Práctica ágil adicional: Code Review mediante Pull Requests

Cada rama de funcionalidad fue integrada a `develop` exclusivamente mediante *pull requests* en GitHub, los cuales debían ser revisados y aprobados por al menos un integrante del equipo distinto al autor. Esta práctica garantizó la revisión colectiva del código, mejoró la consistencia del estilo y sirvió como punto de control de calidad antes de integrar cambios.

---

## 4. Diseño del sistema

### 4.1 Arquitectura

El sistema se implementó como una **Single Page Application (SPA)** con Vue 3 y Vite, sin backend. La persistencia de datos se realizó mediante `localStorage` del navegador. La lógica del chatbot se implementó como una **máquina de estados finitos**, patrón que garantiza la predictibilidad del flujo conversacional y facilita la prueba unitaria de cada transición.

### 4.2 Estructura de componentes

```
src/
├── chatbot/
│   ├── botEngine.js      # Motor central: función process(input, state, context, store)
│   ├── states.js         # 18 constantes de estado
│   └── validators.js     # Validación de rangos y alertas clínicas
├── components/
│   ├── ChatWindow.vue    # Contenedor del chat con scroll automático
│   ├── ChatInput.vue     # Entrada de texto del usuario
│   └── MessageBubble.vue # Burbuja de mensaje con tipos de estilo
└── store/
    └── dataStore.js      # Composable reactivo: CRUD sobre localStorage
```

### 4.3 Modelo de datos

**Paciente:** `{ id, name }`

**Médico (seed):** `{ id, name, password }`

**Registro de signos vitales:** `{ id, patientId, dateTime, systolic, diastolic, heartRate, temperature?, oxygenSat?, observation? }`

### 4.4 Flujo conversacional

El flujo conversacional se modeló como un diagrama de estados (ver Figura 2). El chatbot inicia en el estado `WELCOME` y ramifica según el tipo de usuario (paciente o médico). Para el paciente, el flujo de registro sigue la secuencia: `REG_SYSTOLIC → REG_DIASTOLIC → REG_HEART_RATE → REG_TEMP_ASK → REG_TEMP? → REG_OXSAT_ASK → REG_OXSAT? → PATIENT_MENU`. Para el médico, incluye autenticación con contraseña antes de acceder a las funciones de consulta y anotación.

---

## 5. Refactorización aplicada

Durante la fase de refactorización se identificaron y corrigieron tres tipos de problemas en `botEngine.js`:

**R1 — Eliminación de variable no utilizada:** La función `saveVitalRecord` asignaba el resultado de `store.addRecord()` a una constante `record` que nunca era utilizada posteriormente. Se eliminó la asignación innecesaria, reduciendo la deuda técnica y eliminando una advertencia potencial de linters.

```javascript
// Antes
const record = store.addRecord(context.currentUser.id, { ... })

// Después
store.addRecord(context.currentUser.id, { ... })
```

**R2 — Extracción de lógica duplicada:** Tres funciones (`handleDoctorListPatients`, `handleDoctorSelectPatient`, `handleDoctorSelectPatientForObs`) repetían el mismo bloque de código para formatear la lista de pacientes y generar la respuesta de "no hay pacientes". Se extrajeron dos funciones auxiliares reutilizables: `buildPatientListText(patients)` y `noPatientsResponse(context)`, reduciendo la duplicación de ~30 líneas de código.

**R3 — Corrección del orden de casos en el switch:** El caso `REG_TEMP_ASK` aparecía antes de `REG_HEART_RATE` en el `switch` del motor de estados, pese a que en el flujo real `REG_HEART_RATE` precede a `REG_TEMP_ASK`. Aunque esto no afectaba el funcionamiento (los `case` de un `switch` son independientes), el orden incorrecto dificultaba la lectura y el mantenimiento del código. Se reordenaron para reflejar el flujo real.

---

## 6. Pruebas unitarias

### 6.1 Estrategia y herramientas

Se utilizó **Vitest 4.1** como framework de pruebas, por su integración nativa con Vite y su compatibilidad con ES modules. La estrategia de pruebas se basó en:

- **Aislamiento:** Las pruebas de `botEngine.js` utilizan un *mock* del store (mediante `vi.fn()`) para desacoplar la lógica de estados de la capa de persistencia.
- **Estado limpio por test:** Las pruebas de `dataStore.js` utilizan `vi.resetModules()` con imports dinámicos para obtener una instancia fresca del singleton en cada prueba, y un mock de `localStorage` mediante `vi.stubGlobal()`.
- **Cobertura de bordes:** Se incluyen casos de prueba para valores en los límites exactos de los rangos (mínimo, máximo) y para entradas inválidas.

### 6.2 Distribución de pruebas

| Archivo | Suites | Pruebas | Descripción |
|---|---|---|---|
| `validators.test.js` | 8 | 30 | `validateNumber`, `getVitalAlert` (5 tipos de signo vital), `formatRecord`, integridad de `RANGES` |
| `dataStore.test.js` | 7 | 26 | `getPatients`, `getOrCreatePatient`, `findPatient`, `findDoctor`, `addRecord`, `deleteRecord`, `addObservation` |
| `botEngine.test.js` | 16 | 48 | Transiciones de estado: WELCOME, PATIENT_NAME, DOCTOR_NAME/PASSWORD, PATIENT_MENU, flujo de registro (REG_*), DELETE_SELECT, DOCTOR_MENU, estado desconocido |
| **Total** | **31** | **104** | |

### 6.3 Resultados

```
 Test Files  3 passed (3)
      Tests  104 passed (104)
   Start at  18:58:09
   Duration  613ms
```

**Todos los 104 casos de prueba aprobados en 613 ms**, con 0 fallos y 0 omisiones. Los resultados confirman que:

1. Las validaciones de rangos clínicos funcionan correctamente para todos los signos vitales, incluyendo los límites exactos.
2. Las alertas clínicas se generan apropiadamente en los umbrales de hipertensión (estadios 1 y 2, crisis), taquicardia, bradicardia, fiebre, hipotermia y saturación crítica.
3. El CRUD del store maneja correctamente la deduplicación de pacientes, la insensibilidad a mayúsculas, los campos opcionales y los casos de IDs inexistentes.
4. El motor de estados transiciona correctamente en todos los flujos del paciente y el médico, incluyendo los caminos de error y los retornos al menú.
5. La refactorización no introdujo regresiones: el comportamiento del sistema se preservó completamente.

---

## 7. Discusión

El proceso de desarrollo aplicado demostró que un mini-proceso ágil estructurado, con roles definidos y prácticas concretas, es viable y efectivo para un equipo de tres personas en un proyecto de alcance medio. La integración de la IA como un actor explícito en el proceso (representado en el diagrama BPMN) permitió aprovechar sus capacidades de manera trazable y controlada, sin delegar la responsabilidad técnica del equipo.

La práctica de *code review* mediante *pull requests* resultó especialmente valiosa: los 31 PR realizados durante el proyecto sirvieron como puntos de control donde se detectaron inconsistencias de estilo, lógica redundante y casos no contemplados. Esta práctica también facilitó la distribución del conocimiento sobre el código entre los tres integrantes.

La refactorización, aunque aplicada en una fase dedicada, reveló que hubiera sido beneficioso incorporarla de forma continua durante la codificación. Los tres defectos identificados (variable sin usar, lógica duplicada, orden incorrecto) son típicos de un desarrollo incremental sin revisión continua de la calidad interna del código.

La cobertura de pruebas unitarias al 100% (en términos de casos definidos) proporciona una red de seguridad para futuros cambios, en particular para la lógica de validación clínica, donde los errores pueden tener consecuencias para la salud del usuario.

---

## 8. Conclusiones

Se desarrolló exitosamente un chatbot funcional para el monitoreo de signos vitales en pacientes hipertensos, implementando un mini-proceso ágil con las fases requeridas. Los principales logros del proyecto son:

1. **Sistema funcional:** El chatbot permite el registro completo de signos vitales (presión arterial, frecuencia cardíaca, temperatura y saturación de oxígeno), la consulta de registros con alertas clínicas automáticas, la eliminación de registros y la adición de observaciones médicas.

2. **Proceso documentado:** El proceso fue modelado en un diagrama BPMN con cuatro carriles que incluyen explícitamente el rol de la IA, y gestionado mediante un tablero Kanban en GitHub Projects con 15 ítems de backlog.

3. **Calidad verificada:** La suite de 104 pruebas unitarias automatizadas, con tasa de aprobación del 100%, constituye evidencia objetiva de la correctud del sistema y de que la refactorización no introdujo regresiones.

4. **Trazabilidad completa:** Cada funcionalidad se desarrolló en una rama independiente y fue integrada mediante *pull request*, generando un historial de cambios trazable en el repositorio GitHub.

Como propuesta de mejora para futuros proyectos similares, se recomienda **incorporar la refactorización de forma continua** (en cada *pull request*) en lugar de reservarla para una fase separada, lo que reduciría la acumulación de deuda técnica y distribuiría el esfuerzo de mejora a lo largo del ciclo de desarrollo.

---

## Referencias

Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., … Thomas, D. (2001). *Manifesto for Agile Software Development*. https://agilemanifesto.org

Chen, M., Tworek, J., Jun, H., Yuan, Q., Pinto, H. P., Kaplan, J., … Zaremba, W. (2021). Evaluating large language models trained on code. *arXiv preprint arXiv:2107.03374*. https://doi.org/10.48550/arXiv.2107.03374

Fowler, M. (2018). *Refactoring: Improving the design of existing code* (2nd ed.). Addison-Wesley Professional.

Laranjo, L., Dunn, A. G., Tong, H. L., Kocaballi, A. B., Chen, J., Bashir, R., … Coiera, E. (2018). Conversational agents in healthcare: A systematic review. *Journal of the American Medical Informatics Association, 25*(9), 1248–1258. https://doi.org/10.1093/jamia/ocy072

Organización Mundial de la Salud. (2023). *Hipertensión*. https://www.who.int/es/news-room/fact-sheets/detail/hypertension

Rigby, P. C., & Bird, C. (2013). Convergent contemporary software peer review practices. En *Proceedings of the 9th Joint Meeting on Foundations of Software Engineering* (pp. 202–212). ACM. https://doi.org/10.1145/2491411.2491444

Vitest. (2024). *Vitest: A Vite-native unit test framework*. https://vitest.dev

---

*Repositorio del proyecto:* https://github.com/dianamhenaom-inge/chatBotMedico

*Fecha de entrega:* Marzo 2026
