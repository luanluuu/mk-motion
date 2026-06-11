<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'

export interface TabItem {
  key?: string | number
  label: string
  content?: string
  disabled?: boolean
}

export type TabsType = 'default' | 'card'

export interface TabsProps {
  modelValue?: string | number
  items: TabItem[]
  type?: TabsType
}

const props = withDefaults(defineProps<TabsProps>(), {
  modelValue: undefined,
  type: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  tabClick: [value: string | number, item: TabItem]
}>()

const model = defineModel<string | number>()

const resolvedItems = computed(() =>
  props.items.map((item, index) => ({
    ...item,
    key: item.key ?? index,
  }))
)

const activeKey = computed({
  get: () => model.value ?? props.items[0]?.key ?? 0,
  set: (val: string | number) => {
    model.value = val
    emit('update:modelValue', val)
  },
})

const headerRef = ref<HTMLDivElement | null>(null)
const itemRefs = ref<Record<string | number, HTMLButtonElement | null>>({})
const indicatorStyle = ref({ left: '0px', width: '0px' })

const updateIndicator = async () => {
  if (props.type !== 'default') return
  await nextTick()
  const header = headerRef.value
  const activeBtn = itemRefs.value[activeKey.value]
  if (!header || !activeBtn) return
  const headerRect = header.getBoundingClientRect()
  const tabRect = activeBtn.getBoundingClientRect()
  indicatorStyle.value = {
    left: `${tabRect.left - headerRect.left + header.scrollLeft}px`,
    width: `${tabRect.width}px`,
  }
}

watch(activeKey, updateIndicator, { immediate: true })
onMounted(updateIndicator)

const setActive = (item: (typeof resolvedItems.value)[number]) => {
  if (item.disabled) return
  activeKey.value = item.key
  emit('tabClick', item.key, item)
}

const isActive = (item: (typeof resolvedItems.value)[number]) => activeKey.value === item.key
</script>

<template>
  <div class="mk-tabs" :class="`mk-tabs--${type}`">
    <div ref="headerRef" class="mk-tabs__header" role="tablist">
      <button
        v-for="item in resolvedItems"
        :key="item.key"
        :ref="(el) => { itemRefs[item.key] = el as HTMLButtonElement }"
        type="button"
        class="mk-tabs__item"
        :class="{ 'is-active': isActive(item), 'is-disabled': item.disabled }"
        role="tab"
        :aria-selected="isActive(item)"
        :tabindex="isActive(item) ? 0 : -1"
        @click="setActive(item)"
      >
        {{ item.label }}
      </button>
      <div
        v-if="type === 'default'"
        class="mk-tabs__indicator"
        :style="indicatorStyle"
      />
      <div v-if="$slots.tabBarExtraContent" class="mk-tabs__extra">
        <slot name="tabBarExtraContent" />
      </div>
    </div>
    <div class="mk-tabs__content">
      <div
        v-for="item in resolvedItems"
        v-show="isActive(item)"
        :key="`panel-${item.key}`"
        class="mk-tabs__panel"
        :class="{ 'is-active': isActive(item) }"
        role="tabpanel"
      >
        <slot :name="`panel-${item.key}`">
          {{ item.content }}
        </slot>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.mk-tabs {
  display: flex;
  flex-direction: column;
  gap: var(--mk-space-3);
}

.mk-tabs__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--mk-space-1);
}

.mk-tabs__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--mk-space-3);
  height: 36px;
  font-size: var(--mk-text-sm);
  font-weight: var(--mk-font-medium);
  color: var(--mk-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--mk-radius);
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  transition: var(--mk-transition-colors);
}

.mk-tabs__item:hover:not(.is-disabled) {
  color: var(--mk-text);
  background: var(--mk-surface-hover);
}

.mk-tabs__item.is-active {
  color: var(--mk-text);
}

.mk-tabs__item.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mk-tabs--default .mk-tabs__header {
  border-bottom: 1px solid var(--mk-border);
  gap: 0;
}

.mk-tabs--default .mk-tabs__item {
  border-radius: 0;
  margin-bottom: -1px;
}

.mk-tabs--default .mk-tabs__item.is-active {
  color: var(--mk-primary);
}

.mk-tabs__indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--mk-primary);
  border-radius: 1px;
  transition: left var(--mk-duration-normal) var(--mk-ease-out-expo),
              width var(--mk-duration-normal) var(--mk-ease-out-expo);
}

.mk-tabs--card .mk-tabs__header {
  gap: 0;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  padding: 3px;
}

.mk-tabs--card .mk-tabs__item {
  flex: 1;
  border-radius: var(--mk-radius-sm);
}

.mk-tabs--card .mk-tabs__item.is-active {
  background: var(--mk-surface-raised);
  box-shadow: var(--mk-shadow-sm);
}

.mk-tabs__extra {
  margin-left: auto;
  padding-left: var(--mk-space-2);
}

.mk-tabs__content {
  position: relative;
  min-height: 0;
}

.mk-tabs__panel {
  font-size: var(--mk-text-sm);
  color: var(--mk-text-secondary);
  line-height: var(--mk-leading-normal);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity var(--mk-duration-normal) var(--mk-ease-default),
              transform var(--mk-duration-normal) var(--mk-ease-out);
}

.mk-tabs__panel.is-active {
  opacity: 1;
  transform: translateY(0);
}
</style>
