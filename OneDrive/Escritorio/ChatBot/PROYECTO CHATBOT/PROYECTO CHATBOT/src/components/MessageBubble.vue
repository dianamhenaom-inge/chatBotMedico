<template>
  <!--
    MessageBubble.vue
    ------------------
    Muestra una burbuja de mensaje individual en el chat.
    Props:
      - message: { type: 'user'|'bot'|'bot-success'|'bot-alert'|'bot-error', text: string }
  -->
  <div :class="['message', message.type]">
    <span class="avatar">{{ avatar }}</span>
    <pre class="bubble">{{ message.text }}</pre>
  </div>
</template>

<script>
export default {
  name: 'MessageBubble',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  computed: {
    /** Ícono del remitente según el tipo de mensaje */
    avatar() {
      if (this.message.type === 'user') return '🧑'
      return '🤖'
    },
  },
}
</script>

<style scoped>
.message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

/* Mensajes del usuario: alineados a la derecha */
.message.user {
  flex-direction: row-reverse;
}

.avatar {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 4px;
}

.bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px;
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

/* Bot normal */
.message.bot .bubble {
  background: #f0f4ff;
  color: #1a1a2e;
  border-bottom-left-radius: 4px;
}

/* Bot éxito */
.message.bot-success .bubble {
  background: #d4edda;
  color: #155724;
  border-bottom-left-radius: 4px;
}

/* Bot advertencia */
.message.bot-alert .bubble {
  background: #fff3cd;
  color: #856404;
  border-bottom-left-radius: 4px;
}

/* Bot error */
.message.bot-error .bubble {
  background: #f8d7da;
  color: #721c24;
  border-bottom-left-radius: 4px;
}

/* Usuario */
.message.user .bubble {
  background: #4a90e2;
  color: #fff;
  border-bottom-right-radius: 4px;
}
</style>
