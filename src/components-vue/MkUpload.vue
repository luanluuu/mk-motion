<script setup lang="ts">
import { ref, watch } from 'vue'

export interface UploadFile {
  uid?: string | number
  name: string
  url?: string
  size?: number
  status?: 'ready' | 'uploading' | 'success' | 'error'
  progress?: number
  raw?: File
  response?: unknown
}

interface Props {
  fileList?: UploadFile[]
  accept?: string
  multiple?: boolean
  drag?: boolean
  maxSize?: number
  action?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  drag: false,
})

const emit = defineEmits<{
  change: [files: UploadFile[]]
  preview: [file: UploadFile]
  remove: [file: UploadFile]
  success: [response: unknown, file: UploadFile]
  error: [error: unknown, file: UploadFile]
}>()

const fileList = defineModel<UploadFile[]>('fileList', { default: () => [] })

defineSlots<{
  trigger?: () => unknown
  tip?: () => unknown
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
let uidCounter = 0

const objectUrlCache = new Map<string, string>()

function generateUid() {
  return Date.now() + '-' + ++uidCounter
}

function getObjectUrl(file: File): string {
  const key = `${file.name}-${file.size}-${file.lastModified}`
  if (!objectUrlCache.has(key)) {
    objectUrlCache.set(key, URL.createObjectURL(file))
  }
  return objectUrlCache.get(key)!
}

function revokeObjectUrl(file: File) {
  const key = `${file.name}-${file.size}-${file.lastModified}`
  const url = objectUrlCache.get(key)
  if (url) {
    URL.revokeObjectURL(url)
    objectUrlCache.delete(key)
  }
}

function isImage(file: UploadFile): boolean {
  return file.raw ? file.raw.type.startsWith('image/') : false
}

function formatSize(bytes?: number): string {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleFiles(files: FileList | null) {
  if (!files) return
  const newFiles = Array.from(files)
    .filter((f) => !props.maxSize || f.size <= props.maxSize)
    .map(
      (f): UploadFile => ({
        uid: generateUid(),
        name: f.name,
        size: f.size,
        status: 'ready',
        progress: 0,
        raw: f,
      })
    )

  if (!newFiles.length) return

  const next = props.multiple
    ? [...fileList.value, ...newFiles]
    : newFiles.slice(0, 1)
  fileList.value = next
  emit('change', next)

  next.forEach((file) => {
    if (file.status === 'ready') uploadFile(file)
  })

  if (inputRef.value) inputRef.value.value = ''
}

async function uploadFile(file: UploadFile) {
  if (!props.action || !file.raw) {
    file.status = 'success'
    file.progress = 100
    return
  }

  file.status = 'uploading'
  const formData = new FormData()
  formData.append('file', file.raw)

  try {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        file.progress = Math.round((e.loaded / e.total) * 100)
      }
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        file.status = 'success'
        file.progress = 100
        file.response = xhr.response
        emit('success', xhr.response, file)
      } else {
        file.status = 'error'
        emit('error', xhr.statusText, file)
      }
    })
    xhr.addEventListener('error', () => {
      file.status = 'error'
      emit('error', xhr.statusText, file)
    })
    xhr.open('POST', props.action)
    xhr.send(formData)
  } catch (err) {
    file.status = 'error'
    emit('error', err, file)
  }
}

function onFileChange() {
  handleFiles(inputRef.value?.files ?? null)
}

function onTriggerClick() {
  inputRef.value?.click()
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  handleFiles(e.dataTransfer?.files || null)
}

function removeFile(file: UploadFile) {
  const next = fileList.value.filter((f) => f !== file)
  fileList.value = next
  if (file.raw) revokeObjectUrl(file.raw)
  emit('remove', file)
  emit('change', next)
}

function previewFile(file: UploadFile) {
  emit('preview', file)
}

watch(
  fileList,
  (list, prevList) => {
    list?.forEach((f) => {
      if (f.status === 'ready') uploadFile(f)
    })
    // Revoke URLs for removed files
    prevList?.forEach((f) => {
      if (f.raw && !list?.some((item) => item === f)) {
        revokeObjectUrl(f.raw)
      }
    })
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="mk-upload">
    <input
      ref="inputRef"
      type="file"
      class="mk-upload__input"
      :accept="accept"
      :multiple="multiple"
      @change="onFileChange"
    />

    <div
      v-if="drag"
      class="mk-upload__drag"
      :class="{ 'is-dragover': isDragOver }"
      @click="onTriggerClick"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <slot name="trigger">
        <span>将文件拖到此处，或点击上传</span>
      </slot>
    </div>

    <button
      v-else
      type="button"
      class="mk-upload__trigger"
      @click="onTriggerClick"
    >
      <slot name="trigger">
        <span>点击上传</span>
      </slot>
    </button>

    <div v-if="$slots.tip" class="mk-upload__tip">
      <slot name="tip" />
    </div>

    <div class="mk-upload__list">
      <div
        v-for="file in fileList"
        :key="file.uid ?? file.name"
        class="mk-upload__item"
      >
        <img
          v-if="isImage(file) && file.raw"
          :src="getObjectUrl(file.raw)"
          :alt="file.name"
          class="mk-upload__item-thumb"
        />
        <div class="mk-upload__item-info">
          <span class="mk-upload__item-name" @click="previewFile(file)">{{
            file.name
          }}</span>
          <span class="mk-upload__item-size">{{ formatSize(file.size) }}</span>
        </div>
        <div class="mk-upload__item-progress">
          <div
            class="mk-upload__item-progress-bar"
            :style="{ width: `${file.progress ?? 0}%` }"
          />
        </div>
        <button
          type="button"
          class="mk-upload__item-remove"
          @click="removeFile(file)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mk-upload {
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  max-width: 360px;
}

.mk-upload__input {
  display: none;
}

.mk-upload__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 36px;
  font-size: 13px;
  font-weight: 500;
  color: var(--mk-text);
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  cursor: pointer;
  transition: var(--mk-transition);
  user-select: none;
}

.mk-upload__trigger:hover {
  border-color: var(--mk-border-hover);
  background: var(--mk-surface-hover);
}

.mk-upload__drag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-size: 13px;
  color: var(--mk-text-secondary);
  background: var(--mk-surface);
  border: 2px dashed var(--mk-border);
  border-radius: var(--mk-radius);
  cursor: pointer;
  transition: var(--mk-transition);
  user-select: none;
}

.mk-upload__drag:hover {
  border-color: var(--mk-border-hover);
}

.mk-upload__drag.is-dragover {
  border-color: var(--mk-primary);
  background: var(--mk-primary-muted);
  color: var(--mk-primary);
}

.mk-upload__tip {
  font-size: 12px;
  color: var(--mk-text-tertiary);
  margin-top: 4px;
}

.mk-upload__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.mk-upload__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  transition: var(--mk-transition);
}

.mk-upload__item:hover {
  border-color: var(--mk-border-hover);
}

.mk-upload__item-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--mk-radius-sm);
  flex-shrink: 0;
}

.mk-upload__item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.mk-upload__item-name {
  font-size: 13px;
  color: var(--mk-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.mk-upload__item-name:hover {
  color: var(--mk-primary);
}

.mk-upload__item-size {
  font-size: 11px;
  color: var(--mk-text-tertiary);
}

.mk-upload__item-progress {
  width: 60px;
  height: 4px;
  background: var(--mk-border);
  border-radius: var(--mk-radius-full);
  overflow: hidden;
  flex-shrink: 0;
}

.mk-upload__item-progress-bar {
  height: 100%;
  width: 0%;
  background: var(--mk-primary);
  border-radius: var(--mk-radius-full);
  transition: width 0.6s ease;
}

.mk-upload__item-remove {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--mk-text-tertiary);
  font-size: 12px;
  cursor: pointer;
  border-radius: var(--mk-radius-sm);
  transition: var(--mk-transition);
  flex-shrink: 0;
}

.mk-upload__item-remove:hover {
  background: var(--mk-danger-soft);
  color: var(--mk-danger);
}
</style>
