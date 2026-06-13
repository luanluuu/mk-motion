import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { MkCard } from '../src/vue/card.ts'

async function main() {
  const app = createSSRApp({
    components: { MkCard },
    template:
      '<div><MkCard title="Test Card" body="Hello World" shadow="hover" /></div>',
  })
  try {
    const html = await renderToString(app)
    console.log('Output:', html.slice(0, 500))
    console.log(
      html.includes('mk-card')
        ? '\nPASS: mk-card class found'
        : '\nFAIL: no mk-card class'
    )
  } catch (e: any) {
    console.error('Error:', e.message)
  }
}
main()
