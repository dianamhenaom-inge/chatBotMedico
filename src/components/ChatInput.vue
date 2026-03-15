<template>
  <!--
    ChatInput.vue
    ---------------
    Barra de entrada del usuario. Emite el evento 'send' con el texto.
    Soporta envío con Enter o clic en el botón.
  -->
  <form class="chat-input" @submit.prevent="send">
    <input
      ref="inputRef"
      v-model="text"
      type="text"
      placeholder="Escribe aquí..."
      autocomplete="off"
      :disabled="disabled"
    />
    <button type="submit" :disabled="disabled || !text.trim()">
      Enviar
    </button>
  </form>
</template>

<script>
export default {
  name: 'ChatInput',
  emits: ['send'],
  props: {
    /** Deshabilita el input mientras el bot "procesa" */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { text: '' }
  },
  methods: {
    send() {
      const trimmed = this.text.trim()
      if (!trimmed) return
      this.$emit('send', trimmed)
      this.text = ''
      this.$nextTick(() => this.$refs.inputRef?.focus())
    },
  },
}
</script>

<style scoped>
.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 24px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #4a90e2;
}

input:disabled {
  background: #f5f5f5;
}

button {
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #357abd;
}

button:disabled {
  background: #b0c4de;
  cursor: not-allowed;
}
</style>
