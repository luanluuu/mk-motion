<template>
  <div class="example-page">
    <div class="example-hero">
      <h1 class="example-title">💬 AnimatedDialog</h1>
      <p class="example-desc">
        Spring 驱动的对话框弹出/关闭 — Spring 物理弹入 + 遮罩渐显。
      </p>
    </div>

    <div class="example-body">
      <div class="example-hint">
        <MkTag type="info" size="small">💡 点击按钮查看不同样式的对话框</MkTag>
      </div>

      <MkSpace style="margin-bottom: 32px;">
        <MkButton type="primary" @click="openDialog('basic')">基础弹窗</MkButton>
        <MkButton type="success" @click="openDialog('confirm')">确认对话框</MkButton>
        <MkButton type="warning" @click="openDialog('form')">表单弹窗</MkButton>
      </MkSpace>

      <!-- Basic Dialog -->
      <MkDialog
        v-model="dialogStates.basic"
        title="弹簧弹窗示例"
        :animation="dialogAnimation"
      >
        <p style="margin: 0; line-height: 1.7; color: var(--mk-text-secondary);">
          这个对话框使用了 MotionKit 的弹簧动画引擎。
          弹出时从 80% 缩放弹性过渡到 100%，带有真实的物理回弹感。
          <br /><br />
          遮罩层也带有渐显动画，配合阻尼效果让体验更加流畅。
        </p>
        <template #footer>
          <MkButton @click="dialogStates.basic = false">取消</MkButton>
          <MkButton type="primary" @click="dialogStates.basic = false">确定</MkButton>
        </template>
      </MkDialog>

      <!-- Confirm Dialog -->
      <MkDialog
        v-model="dialogStates.confirm"
        title="确认删除"
        :animation="dialogAnimation"
      >
        <p style="margin: 0; color: var(--mk-text-secondary);">
          确定要删除此项吗？此操作不可撤销。
        </p>
        <template #footer>
          <MkButton @click="dialogStates.confirm = false">取消</MkButton>
          <MkButton type="danger" @click="confirmDelete">确认删除</MkButton>
        </template>
      </MkDialog>

      <!-- Form Dialog -->
      <MkDialog
        v-model="dialogStates.form"
        title="编辑信息"
        :animation="dialogAnimation"
      >
        <MkSpace direction="vertical" size="large" style="width: 100%;">
          <MkInput v-model="formData.name" placeholder="名称" style="width: 100%;" />
          <MkInput v-model="formData.email" placeholder="邮箱" style="width: 100%;" />
          <MkSelect
            v-model="formData.role"
            :options="roleOptions"
            placeholder="角色"
            style="width: 100%;"
          />
        </MkSpace>
        <template #footer>
          <MkButton @click="dialogStates.form = false">取消</MkButton>
          <MkButton type="primary" @click="saveForm">保存</MkButton>
        </template>
      </MkDialog>

      <div v-if="actionResult" class="action-result">
        <MkTag :type="actionResult.type">{{ actionResult.message }}</MkTag>
      </div>

      <div class="example-code-hint">
        <p>核心 API：<code>MkDialog</code> 组件 + <code>springOverlay</code> 弹簧动画预设</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const dialogAnimation = 'spring'
const dialogStates = reactive({
  basic: false,
  confirm: false,
  form: false,
})

const formData = reactive({ name: '', email: '', role: '' })
const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑者', value: 'editor' },
  { label: '访客', value: 'guest' },
]

const actionResult = ref<{ type: string; message: string } | null>(null)
let resultTimer: ReturnType<typeof setTimeout> | null = null

function openDialog(type: keyof typeof dialogStates) {
  dialogStates[type] = true
}

function confirmDelete() {
  dialogStates.confirm = false
  showResult('danger', '已成功删除')
}

function saveForm() {
  dialogStates.form = false
  showResult('success', `已保存：${formData.name || '(未命名)'}`)
}

function showResult(type: string, message: string) {
  actionResult.value = { type, message }
  if (resultTimer) clearTimeout(resultTimer)
  resultTimer = setTimeout(() => (actionResult.value = null), 3000)
}
</script>

<style scoped>
.example-page { max-width: 760px; margin: 0 auto; padding-bottom: 80px; }
.example-hero { text-align: center; padding: 56px 24px 32px; }
.example-title { font-size: 1.8rem; font-weight: 700; margin: 0 0 8px; }
.example-desc { font-size: 0.95rem; color: var(--mk-text-secondary); margin: 0; }

.example-body { padding: 0 24px; }
.example-hint { margin-bottom: 24px; }

.action-result { margin-top: 16px; }
.example-code-hint {
  margin-top: 32px; padding: 16px;
  background: var(--mk-surface); border-radius: var(--mk-radius-lg);
  font-size: 0.85rem; color: var(--mk-text-secondary);
}
.example-code-hint code {
  background: var(--mk-bg-elevated); padding: 2px 6px;
  border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.82rem;
}
</style>
