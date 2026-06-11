<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  href?: string
  target?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string
}

withDefaults(defineProps<BreadcrumbProps>(), {
  separator: '/',
})

const emit = defineEmits<{
  click: [index: number, item: BreadcrumbItem]
}>()

const onClick = (index: number, item: BreadcrumbItem) => {
  emit('click', index, item)
}
</script>

<template>
  <nav class="mk-breadcrumb" aria-label="breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index > 0" class="mk-breadcrumb__separator">
        <slot name="separator">{{ separator }}</slot>
      </span>

      <template v-if="index === items.length - 1">
        <span class="mk-breadcrumb__item is-current" aria-current="page">
          <slot name="item" :item="item" :index="index">{{ item.label }}</slot>
        </span>
      </template>
      <template v-else>
        <a
          v-if="item.href"
          class="mk-breadcrumb__item is-link"
          :href="item.href"
          :target="item.target"
          @click="onClick(index, item)"
        >
          <slot name="item" :item="item" :index="index">{{ item.label }}</slot>
        </a>
        <span
          v-else
          class="mk-breadcrumb__item is-link"
          role="link"
          tabindex="0"
          @click="onClick(index, item)"
          @keydown.enter.prevent="onClick(index, item)"
        >
          <slot name="item" :item="item" :index="index">{{ item.label }}</slot>
        </span>
      </template>
    </template>
  </nav>
</template>

<style scoped>
.mk-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: var(--mk-text-sm);
  color: var(--mk-text-secondary);
}

.mk-breadcrumb__item {
  transition: var(--mk-transition-colors);
}

.mk-breadcrumb__item.is-link {
  color: var(--mk-text-secondary);
  cursor: pointer;
  text-decoration: none;
}

.mk-breadcrumb__item.is-link:hover {
  color: var(--mk-primary);
}

.mk-breadcrumb__item.is-current {
  color: var(--mk-text);
  font-weight: var(--mk-font-medium);
}

.mk-breadcrumb__separator {
  margin: 0 8px;
  color: var(--mk-text-tertiary);
  user-select: none;
}
</style>
