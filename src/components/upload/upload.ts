import './upload.css'

export interface UploadOptions {
  accept?: string
  multiple?: boolean
  drag?: boolean
  maxSize?: number
  onChange?: (files: File[]) => void
  onPreview?: (file: File) => void
  onRemove?: (file: File) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

export class MkUpload {
  el: HTMLDivElement
  private options: UploadOptions
  private fileInput: HTMLInputElement
  private listEl: HTMLDivElement
  private dragEl?: HTMLDivElement
  private files: File[] = []

  constructor(container: HTMLElement | string, options: UploadOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      multiple: false,
      drag: false,
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = 'mk-upload'

    this.fileInput = document.createElement('input')
    this.fileInput.type = 'file'
    this.fileInput.className = 'mk-upload__input'
    if (this.options.accept) this.fileInput.accept = this.options.accept
    if (this.options.multiple) this.fileInput.multiple = true
    this.fileInput.addEventListener('change', () => {
      this.handleFiles(this.fileInput.files)
    })

    if (this.options.drag) {
      this.dragEl = document.createElement('div')
      this.dragEl.className = 'mk-upload__drag'
      this.dragEl.textContent = '将文件拖到此处，或点击上传'
      this.dragEl.addEventListener('click', () => this.fileInput.click())

      this.dragEl.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.dragEl!.classList.add('is-dragover')
      })

      this.dragEl.addEventListener('dragleave', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.dragEl!.classList.remove('is-dragover')
      })

      this.dragEl.addEventListener('drop', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.dragEl!.classList.remove('is-dragover')
        this.handleFiles(e.dataTransfer?.files || null)
      })

      this.el.appendChild(this.dragEl)
    } else {
      const trigger = document.createElement('button')
      trigger.type = 'button'
      trigger.className = 'mk-upload__trigger'
      trigger.textContent = '点击上传'
      trigger.addEventListener('click', () => this.fileInput.click())
      this.el.appendChild(trigger)
    }

    this.el.appendChild(this.fileInput)

    this.listEl = document.createElement('div')
    this.listEl.className = 'mk-upload__list'
    this.el.appendChild(this.listEl)

    parent.appendChild(this.el)
  }

  private handleFiles(fileList: FileList | null): void {
    if (!fileList) return
    const newFiles = Array.from(fileList)
    const filtered = this.options.maxSize
      ? newFiles.filter((f) => f.size <= this.options.maxSize!)
      : newFiles

    if (this.options.multiple) {
      this.files = [...this.files, ...filtered]
    } else {
      this.files = filtered.slice(0, 1)
    }

    this.renderList()
    this.options.onChange?.([...this.files])
  }

  private renderList(): void {
    this.listEl.innerHTML = ''
    this.files.forEach((file) => {
      const item = document.createElement('div')
      item.className = 'mk-upload__item'

      if (isImage(file)) {
        const thumb = document.createElement('img')
        thumb.className = 'mk-upload__item-thumb'
        thumb.src = URL.createObjectURL(file)
        thumb.alt = file.name
        item.appendChild(thumb)
      }

      const info = document.createElement('div')
      info.className = 'mk-upload__item-info'

      const name = document.createElement('span')
      name.className = 'mk-upload__item-name'
      name.textContent = file.name
      name.addEventListener('click', () => this.options.onPreview?.(file))

      const size = document.createElement('span')
      size.className = 'mk-upload__item-size'
      size.textContent = formatSize(file.size)

      info.appendChild(name)
      info.appendChild(size)

      const progress = document.createElement('div')
      progress.className = 'mk-upload__item-progress'
      const progressBar = document.createElement('div')
      progressBar.className = 'mk-upload__item-progress-bar'
      progress.appendChild(progressBar)

      // Simulate progress
      requestAnimationFrame(() => {
        progressBar.style.width = '100%'
      })

      const remove = document.createElement('button')
      remove.type = 'button'
      remove.className = 'mk-upload__item-remove'
      remove.textContent = '✕'
      remove.addEventListener('click', () => {
        this.files = this.files.filter((f) => f !== file)
        this.renderList()
        this.options.onRemove?.(file)
        this.options.onChange?.([...this.files])
      })

      item.appendChild(info)
      item.appendChild(progress)
      item.appendChild(remove)
      this.listEl.appendChild(item)
    })
  }

  getFileList(): File[] {
    return [...this.files]
  }

  clear(): void {
    this.files = []
    this.fileInput.value = ''
    this.renderList()
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createUpload(
  container: HTMLElement | string,
  options?: UploadOptions
): MkUpload {
  return new MkUpload(container, options)
}
