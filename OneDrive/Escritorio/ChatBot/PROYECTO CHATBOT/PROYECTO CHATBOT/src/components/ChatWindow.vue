<template>
  <!--
    ChatWindow.vue
    ---------------
    Componente principal del chat.
    Responsabilidades:
      - Renderizar la lista de mensajes
      - Recibir input del usuario y pasarlo al botEngine
      - Mantener el estado y contexto de la conversación
      - Comunicarse con el dataStore
  -->
</template>

<script>
import MessageBubble from './MessageBubble.vue'
import ChatInput     from './ChatInput.vue'
import { process, getWelcomeMessages } from '../chatbot/botEngine.js'
import { STATES }   from '../chatbot/states.js'
import { useStore }  from '../store/dataStore.js'

export default {
  name: 'ChatWindow',
  components: { MessageBubble, ChatInput },

  data() {
    return {
      messages:  [],
      state:     STATES.WELCOME,
      context:   {},
      isTyping:  false,
      store:     useStore(),
    }
  },

  mounted() {
    // TODO: mostrar mensajes de bienvenida
  },

  methods: {
    /**
     * Procesa el texto enviado por el usuario.
     * @param {string} text
     */
    async handleUserInput(text) {
      // TODO: implementar flujo de conversación
    },
  },
}
</script>

<style scoped>
/* TODO: estilos del chat */
</style>
