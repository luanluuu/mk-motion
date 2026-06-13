<template>
  <header class="doc-header">
    <div class="doc-header-left">
      <a href="/home" class="doc-logo" @click.prevent="goTo('home')">
        <span class="doc-logo-mark">M</span>MotionKit
      </a>
      <nav class="doc-header-nav">
        <MkButton
          v-for="item in headerNavItems"
          :key="item.key"
          type="text"
          @click="goTo(item.key)"
        >
          {{ item.label }}
        </MkButton>
      </nav>
    </div>
    <div class="doc-header-right">
      <div class="theme-wrap">
        <span class="theme-icon" title="暗色" @click="sliderValue = 0">🌙</span>
        <MkSlider
          v-model="sliderValue"
          :min="0"
          :max="100"
          :step="1"
          :show-value="false"
          class="slider-container"
          @change="onSliderChange"
        />
        <span class="theme-icon" title="亮色" @click="sliderValue = 100"
          >☀️</span
        >
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { headerNavItems } from '../data/nav.js'
import { goTo } from '../router.js'
import { setColorTemp } from '../shared/theme-interpolator.js'

const sliderValue = ref(0)

function startTransition() {
  document.documentElement.setAttribute('data-mk-theme-transitioning', '')
}

function endTransition() {
  setTimeout(() => {
    document.documentElement.removeAttribute('data-mk-theme-transitioning')
  }, 250)
}

function onSliderChange(value: number) {
  startTransition()
  setColorTemp(value / 100)
  endTransition()
}
</script>

<style scoped>
.doc-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--mk-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--mk-border);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.doc-header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.doc-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--mk-text);
  text-decoration: none;
  letter-spacing: -0.3px;
}

.doc-logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--mk-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
}

.doc-header-nav {
  display: flex;
  gap: 4px;
}

.doc-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 140px;
}

.theme-icon {
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
}

.slider-container {
  flex: 1;
  min-width: 0;
}
</style>
