import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import './assets/tailwind.css'
import './styles/main.scss'

registerSW({ immediate: true })

createApp(App).mount('#app')
