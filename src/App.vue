<template>
  <!--
    App.vue
    --------
    Componente raíz. Centra el ChatWindow en pantalla completa.
  -->
  <div class="app-container">
    <ChatWindow/>
  </div>
</template>

<script>
import ChatWindow from './components/ChatWindow.vue'

export default {
  name: 'App',
  components: {ChatWindow},
}
</script>

<style>
/* ── Estilos globales ───────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(160deg, #e8f0fe 0%, #c9d8f8 100%);
  min-height: 100vh;
}

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
}

/* El chat ocupa un ancho máximo cómodo y toda la altura disponible */
.app-container > * {
  width: 100%;
  max-width: 680px;
  height: min(700px, calc(100vh - 48px));
}
</style>
