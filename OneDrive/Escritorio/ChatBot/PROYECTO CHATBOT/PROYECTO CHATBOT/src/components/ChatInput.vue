<template>
  <!--
    ChatInput.vue
    ---------------
    Barra de entrada del usuario.
    Emite el evento 'send' con el texto al presionar Enter o el botón.
    Props:
      - disabled: boolean (bloquea el input mientras el bot procesa)
  -->
</template>

<script>
export default {
  name: 'ChatInput',
  emits: ['send'],
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  // TODO: implementar data, methods y estilos
}
</script>

<style scoped>
/* TODO: estilos del input */
</style>
