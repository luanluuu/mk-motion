import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.ts'

// Doc site styles
import './styles/docs.css'

// Component + animation + theme styles
import '@luanlu/mk-motion/css'

createApp(App).use(router).mount('#app')
