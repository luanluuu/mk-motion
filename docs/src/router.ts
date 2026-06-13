import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import ComponentsOverview from './views/ComponentsOverview.vue'
import Animations from './views/Animations.vue'
import DesignTokens from './views/DesignTokens.vue'
import ThemeGenerator from './views/ThemeGenerator.vue'
import MotionSpec from './views/MotionSpec.vue'
import ApiStability from './views/ApiStability.vue'
import ComponentDoc from './views/ComponentDoc.vue'
import ExamplesLanding from './views/ExamplesLanding.vue'
import SortableTodoList from './views/examples/SortableTodoList.vue'
import SortableTableRows from './views/examples/SortableTableRows.vue'
import AnimatedDialog from './views/examples/AnimatedDialog.vue'
import RouteTransition from './views/examples/RouteTransition.vue'
import FilterableGrid from './views/examples/FilterableGrid.vue'
import NumberCounter from './views/examples/NumberCounter.vue'
import Gesture from './views/Gesture.vue'
import DevTools from './views/DevTools.vue'
import Nuxt from './views/Nuxt.vue'
import Flip from './views/Flip.vue'
import Effects from './views/Effects.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/examples', component: ExamplesLanding },
    { path: '/examples/sortable-todo', component: SortableTodoList },
    { path: '/examples/sortable-table', component: SortableTableRows },
    { path: '/examples/animated-dialog', component: AnimatedDialog },
    { path: '/examples/route-transition', component: RouteTransition },
    { path: '/examples/filterable-grid', component: FilterableGrid },
    { path: '/examples/number-counter', component: NumberCounter },
    { path: '/components', component: ComponentsOverview },
    { path: '/animations', component: Animations },
    { path: '/design-tokens', component: DesignTokens },
    { path: '/theme-generator', component: ThemeGenerator },
    { path: '/motion-spec', component: MotionSpec },
    { path: '/api-stability', component: ApiStability },
    { path: '/gesture', component: Gesture },
    { path: '/devtools', component: DevTools },
    { path: '/nuxt', component: Nuxt },
    { path: '/flip', component: Flip },
    { path: '/effects', component: Effects },
    { path: '/component-:name', component: ComponentDoc, props: true },
  ],
})

export function goTo(key: string) {
  router.push('/' + key)
}
