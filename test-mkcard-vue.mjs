import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { MkCard } from './src/vue/card.ts'

const app = createSSRApp({
  components: { MkCard },
  template: '<div><MkCard title="Test Card" body="Hello World" shadow="hover" /></div>'
})

try {
  const html = await renderToString(app)
  console.log('SSR output:', html.slice(0, 600))
  if (html.includes('mk-card')) {
    console.log('\nPASS: Native mk-card class found in output')
  } else {
    console.log('\nFAIL: No mk-card class found')
  }
} catch (err) {
  console.error('SSR Error:', err.message)
}
