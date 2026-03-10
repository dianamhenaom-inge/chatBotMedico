<template>
  <!--
    MessageBubble.vue
    ------------------
    Muestra una burbuja de mensaje individual.
    Props:
      - message: { type: 'user'|'bot'|'bot-success'|'bot-alert'|'bot-error', text: string }
  -->
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
  // TODO: implementar computed, métodos y estilos
}
</script>

<style scoped>
/* TODO: estilos de las burbujas */
</style>
