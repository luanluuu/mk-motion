<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  MkButton,
  MkInput,
  MkSlider,
  MkSwitch,
  MkCard,
  MkDialog,
} from '@luanlu/mk-motion/vue'
import { useMkTheme, useMkLoading, useMkMessage, useMkMotion } from '@luanlu/mk-motion/vue'

const { isDark, toggle } = useMkTheme()
const { start: startLoading, stop: stopLoading } = useMkLoading()
const { success, error } = useMkMessage()

const name = ref('')
const volume = ref(50)
const enabled = ref(false)
const showDialog = ref(false)
const btnLoading = ref(false)

const motionEl = ref<HTMLElement>()
useMkMotion(motionEl, { hover: 'lift', enter: 'bounceIn', duration: 400 })

onMounted(() => {
  document.documentElement.setAttribute('data-mk-theme', 'dark')
})

function handleSubmit() {
  btnLoading.value = true
  startLoading({ text: '提交中...' })
  setTimeout(() => {
    btnLoading.value = false
    stopLoading()
    success(`提交成功：${name.value}`)
  }, 1500)
}

function handleError() {
  error('操作失败，请重试')
}
</script>

<template>
  <div style="padding: 40px; max-width: 900px; margin: 0 auto; font-family: system-ui, sans-serif;">
    <h1 style="font-size: 2rem; margin-bottom: 8px; color: var(--mk-text);">
      @luanlu/mk-motion <span style="color: var(--mk-primary);">Vue Demo</span>
    </h1>
    <p style="color: var(--mk-text-secondary); margin-bottom: 32px;">
      基于 mk-motion 动效库的 Vue 深度适配演示
    </p>

    <!-- 主题切换 -->
    <MkCard shadow="hover" style="margin-bottom: 24px;">
      <template #header>🎨 主题控制</template>
      <div style="display: flex; gap: 12px; align-items: center;">
        <MkSwitch v-model="isDark" active-text="暗色" inactive-text="亮色" @change="toggle" />
        <span style="color: var(--mk-text-secondary); font-size: 0.875rem;">
          当前：{{ isDark ? '暗色' : '亮色' }}
        </span>
      </div>
    </MkCard>

    <!-- 按钮展示 -->
    <MkCard shadow="hover" style="margin-bottom: 24px;">
      <template #header>🔘 按钮组件</template>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
        <MkButton type="default">默认</MkButton>
        <MkButton type="primary">主要</MkButton>
        <MkButton type="success">成功</MkButton>
        <MkButton type="warning">警告</MkButton>
        <MkButton type="danger">危险</MkButton>
        <MkButton type="primary" :loading="btnLoading" @click="handleSubmit">
          提交中...
        </MkButton>
        <MkButton type="danger" @click="handleError">触发错误</MkButton>
      </div>
    </MkCard>

    <!-- 表单组件 -->
    <MkCard shadow="hover" style="margin-bottom: 24px;">
      <template #header>📝 表单组件</template>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 6px; color: var(--mk-text-secondary); font-size: 0.875rem;">
            用户名（v-model）
          </label>
          <MkInput v-model="name" placeholder="请输入用户名" clearable />
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; color: var(--mk-text-secondary); font-size: 0.875rem;">
            音量：{{ volume }}
          </label>
          <MkSlider v-model="volume" :min="0" :max="100" :step="1" />
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <MkSwitch v-model="enabled" active-text="开启" inactive-text="关闭" />
          <span style="color: var(--mk-text-secondary); font-size: 0.875rem;">
            状态：{{ enabled ? '已开启' : '已关闭' }}
          </span>
        </div>
      </div>
    </MkCard>

    <!-- Dialog -->
    <MkCard shadow="hover" style="margin-bottom: 24px;">
      <template #header>💬 对话框</template>
      <MkButton type="primary" @click="showDialog = true">打开对话框</MkButton>
    </MkCard>

    <!-- 动画效果 -->
    <MkCard shadow="hover" style="margin-bottom: 24px;">
      <template #header>✨ 动画效果</template>
      <div
        ref="motionEl"
        style="
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, var(--mk-primary), var(--mk-primary-light));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          cursor: pointer;
        "
      >
        悬停我
      </div>
    </MkCard>

    <!-- Dialog -->
    <MkDialog
      v-model="showDialog"
      title="确认操作"
      @confirm="success('已确认')"
      @cancel="error('已取消')"
    >
      <p>确定要执行此操作吗？</p>
      <p style="color: var(--mk-text-secondary); font-size: 0.875rem; margin-top: 8px;">
        此操作不可撤销。
      </p>
    </MkDialog>
  </div>
</template>

<style>
body {
  background-color: var(--mk-bg);
  color: var(--mk-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
