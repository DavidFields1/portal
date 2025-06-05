// src/main.ts
import './assets/main.css' // Asegúrate que los estilos globales/tailwind se importan

import { createApp } from 'vue'
import { createPinia } from 'pinia' // Importar createPinia

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia()) // Usar Pinia
app.use(router)

app.mount('#app')
