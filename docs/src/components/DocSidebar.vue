<template>
  <aside class="doc-sidebar">
    <MkMenu
      mode="vertical"
      :items="menuItems"
      :default-active="activeIndex"
      @select="onMenuSelect"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MkMenu } from 'mk-motion/vue'
import type { MenuItem } from 'mk-motion/vue'
import { sidebarMenuItems } from '../data/nav.js'
import { goTo } from '../router.js'

const route = useRoute()

const menuItems: MenuItem[] = sidebarMenuItems.map((item) => ({
  index: item.index,
  label: item.label,
  icon: item.icon,
  disabled: item.disabled,
}))

const activeIndex = computed(() => {
  const path = route.path.replace(/^\//, '')
  return path || 'home'
})

function onMenuSelect(index: string) {
  if (!index.startsWith('divider')) {
    goTo(index)
  }
}
</script>

<style scoped>
.doc-sidebar {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid var(--mk-border);
  padding: 12px 0;
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  overflow-y: auto;
  background: var(--mk-bg);
}

@media (max-width: 900px) {
  .doc-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .doc-sidebar.open {
    transform: translateX(0);
  }
}
</style>
