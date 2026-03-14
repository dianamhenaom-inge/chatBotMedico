<template>
  <!--
    ChatWindow.vue
    ---------------
    Contenedor principal del chat.
    Maneja:
      - Lista de mensajes con scroll automático
      - Comunicación con el botEngine (state machine)
      - Integración con el dataStore
  -->
  <div class="chat-wrapper">
    <!-- Encabezado -->
    <header class="chat-header">
      <span class="header-icon">💊</span>
      <div>
        <h1>ChatBot Hipertensión</h1>
        <small>Registro y seguimiento de signos vitales</small>
      </div>
    </header>

    <!-- Área de mensajes -->
    <div class="messages-area" ref="messagesArea">
      <MessageBubble
        v-for="(msg, idx) in messages"
        :key="idx"
        :message="msg"
      />

      <!-- Indicador de escritura -->
      <div v-if="isTyping" class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- Input del usuario -->
    <ChatInput :disabled="isTyping" @send="handleUserInput" />
  </div>
</template>

<script>
import MessageBubble from './MessageBubble.vue'
import ChatInput     from './ChatInput.vue'
import { process, getWelcomeMessages } from '../chatbot/botEngine.js'
import { STATES }  from '../chatbot/states.js'
import { useStore } from '../store/dataStore.js'

export default {
  name: 'ChatWindow',
  components: { MessageBubble, ChatInput },

  data() {
    return {
      messages:  [],          // Array de { type, text }
      state:     STATES.WELCOME,
      context:   {},          // Datos de sesión acumulados
      isTyping:  false,       // Muestra animación de escritura
      store:     useStore(),  // API de datos
    }
  },

  mounted() {
    // Muestra los mensajes de bienvenida al iniciar
    this.pushMessages(getWelcomeMessages())
  },

  methods: {
    /**
     * Procesa el texto enviado por el usuario:
     * 1. Agrega el mensaje del usuario al chat
     * 2. Invoca el motor del bot
     * 3. Muestra la respuesta del bot con un pequeño retardo (UX)
     */
    async handleUserInput(text) {
      // Mensaje del usuario
      this.messages.push({ type: 'user', text })

      this.isTyping = true
      await this.delay(400)   // Simula tiempo de "procesamiento"

      // Motor del bot: state machine
      const result = process(text, this.state, this.context, this.store)

      this.state   = result.nextState
      this.context = result.context
      this.isTyping = false

      this.pushMessages(result.messages)
    },

    /** Agrega mensajes al array y hace scroll automático */
    pushMessages(msgs) {
      this.messages.push(...msgs)
      this.$nextTick(() => this.scrollToBottom())
    },

    scrollToBottom() {
      const el = this.$refs.messagesArea
      if (el) el.scrollTop = el.scrollHeight
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
  },
}
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

/* ── Encabezado ─────────────────────────────────── */
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #4a90e2, #2c5fa7);
  color: white;
}

.header-icon {
  font-size: 2rem;
}

.chat-header h1 {
  margin: 0;
  font-size: 1.1rem;
}

.chat-header small {
  font-size: 0.8rem;
  opacity: 0.85;
}

/* ── Área de mensajes ───────────────────────────── */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  background: #f8f9fb;
  scroll-behavior: smooth;
}

/* ── Indicador de escritura (tres puntos animados) ─ */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: #f0f4ff;
  border-radius: 16px;
  width: fit-content;
  border-bottom-left-radius: 4px;
  margin-bottom: 12px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #4a90e2;
  border-radius: 50%;
  animation: bounce 1.2s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%            { transform: translateY(-6px); }
}
</style>

