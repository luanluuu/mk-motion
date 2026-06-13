<template>
  <div class="doc-layout-wrapper" :class="{ 'is-home': isHome }">
    <DocHeader />
    <DocSidebar v-if="!isHome" />
    <main class="doc-main" id="main" :class="{ 'is-home': isHome }">
      <slot />
    </main>
    <aside
      v-if="!isHome"
      class="doc-toc"
      id="toc"
      style="display: none"
    ></aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DocHeader from './DocHeader.vue'
import DocSidebar from './DocSidebar.vue'

const route = useRoute()
const isHome = computed(
  () =>
    route.path === '/home' || route.path === '/' || route.path === '/examples'
)
</script>

<style scoped>
.doc-layout-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 60px;
  min-height: 100vh;
  padding-right: 260px; /* 为右侧 TOC 留出空间 */
}

.doc-layout-wrapper.is-home {
  padding-right: 0;
  display: block;
}

.doc-main {
  flex: 0 1 1200px;
  padding: 40px 48px 80px;
  margin-left: 260px;
}

.doc-main.is-home {
  margin-left: 0;
  max-width: 100%;
  padding: 0;
  flex: 1 1 auto;
}

.doc-toc {
  width: 220px;
  flex-shrink: 0;
  position: fixed;
  top: 100px;
  right: 24px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .doc-layout-wrapper {
    padding-right: 0;
  }
  .doc-toc {
    display: none;
  }
}

@media (max-width: 900px) {
  .doc-main {
    margin-left: 0;
    max-width: 100%;
    padding: 24px;
  }
  .doc-main.is-home {
    padding: 0;
  }
}
</style>
