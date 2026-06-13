<script setup lang="ts">
import { computed, inject } from 'vue'

const props = withDefaults(
  defineProps<{
    span?: number | 'flex'
    offset?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }>(),
  {
    span: 24,
  }
)

const gutter = inject<number>('mk-row-gutter', 0)

const colClass = computed(() => {
  const classes = ['mk-col']
  if (props.span === 'flex') classes.push('mk-col--flex')
  else classes.push(`mk-col-${props.span}`)
  if (props.offset) classes.push(`mk-col-offset-${props.offset}`)
  if (props.sm) classes.push(`mk-col-sm-${props.sm}`)
  if (props.md) classes.push(`mk-col-md-${props.md}`)
  if (props.lg) classes.push(`mk-col-lg-${props.lg}`)
  if (props.xl) classes.push(`mk-col-xl-${props.xl}`)
  return classes
})

const colStyle = computed(() => {
  if (gutter) {
    return { padding: `0 ${gutter / 2}px` }
  }
  return undefined
})
</script>

<template>
  <div :class="colClass" :style="colStyle">
    <slot />
  </div>
</template>

<style>
.mk-col {
  padding: 0 8px;
  flex: 0 0 auto;
  box-sizing: border-box;
}

.mk-col--flex {
  flex: 1;
}

.mk-col-1 {
  flex: 0 0 4.1667%;
}
.mk-col-2 {
  flex: 0 0 8.3333%;
}
.mk-col-3 {
  flex: 0 0 12.5%;
}
.mk-col-4 {
  flex: 0 0 16.6667%;
}
.mk-col-5 {
  flex: 0 0 20.8333%;
}
.mk-col-6 {
  flex: 0 0 25%;
}
.mk-col-7 {
  flex: 0 0 29.1667%;
}
.mk-col-8 {
  flex: 0 0 33.3333%;
}
.mk-col-9 {
  flex: 0 0 37.5%;
}
.mk-col-10 {
  flex: 0 0 41.6667%;
}
.mk-col-11 {
  flex: 0 0 45.8333%;
}
.mk-col-12 {
  flex: 0 0 50%;
}
.mk-col-13 {
  flex: 0 0 54.1667%;
}
.mk-col-14 {
  flex: 0 0 58.3333%;
}
.mk-col-15 {
  flex: 0 0 62.5%;
}
.mk-col-16 {
  flex: 0 0 66.6667%;
}
.mk-col-17 {
  flex: 0 0 70.8333%;
}
.mk-col-18 {
  flex: 0 0 75%;
}
.mk-col-19 {
  flex: 0 0 79.1667%;
}
.mk-col-20 {
  flex: 0 0 83.3333%;
}
.mk-col-21 {
  flex: 0 0 87.5%;
}
.mk-col-22 {
  flex: 0 0 91.6667%;
}
.mk-col-23 {
  flex: 0 0 95.8333%;
}
.mk-col-24 {
  flex: 0 0 100%;
}

.mk-col-offset-1 {
  margin-left: 4.1667%;
}
.mk-col-offset-2 {
  margin-left: 8.3333%;
}
.mk-col-offset-3 {
  margin-left: 12.5%;
}
.mk-col-offset-4 {
  margin-left: 16.6667%;
}
.mk-col-offset-5 {
  margin-left: 20.8333%;
}
.mk-col-offset-6 {
  margin-left: 25%;
}
.mk-col-offset-7 {
  margin-left: 29.1667%;
}
.mk-col-offset-8 {
  margin-left: 33.3333%;
}
.mk-col-offset-9 {
  margin-left: 37.5%;
}
.mk-col-offset-10 {
  margin-left: 41.6667%;
}
.mk-col-offset-11 {
  margin-left: 45.8333%;
}
.mk-col-offset-12 {
  margin-left: 50%;
}

@media (min-width: 640px) {
  .mk-col-sm-4 {
    flex: 0 0 16.6667%;
  }
  .mk-col-sm-6 {
    flex: 0 0 25%;
  }
  .mk-col-sm-8 {
    flex: 0 0 33.3333%;
  }
  .mk-col-sm-12 {
    flex: 0 0 50%;
  }
  .mk-col-sm-24 {
    flex: 0 0 100%;
  }
}

@media (min-width: 768px) {
  .mk-col-md-4 {
    flex: 0 0 16.6667%;
  }
  .mk-col-md-6 {
    flex: 0 0 25%;
  }
  .mk-col-md-8 {
    flex: 0 0 33.3333%;
  }
  .mk-col-md-12 {
    flex: 0 0 50%;
  }
  .mk-col-md-16 {
    flex: 0 0 66.6667%;
  }
  .mk-col-md-24 {
    flex: 0 0 100%;
  }
}

@media (min-width: 1024px) {
  .mk-col-lg-4 {
    flex: 0 0 16.6667%;
  }
  .mk-col-lg-6 {
    flex: 0 0 25%;
  }
  .mk-col-lg-8 {
    flex: 0 0 33.3333%;
  }
  .mk-col-lg-12 {
    flex: 0 0 50%;
  }
  .mk-col-lg-16 {
    flex: 0 0 66.6667%;
  }
  .mk-col-lg-24 {
    flex: 0 0 100%;
  }
}

@media (min-width: 1280px) {
  .mk-col-xl-4 {
    flex: 0 0 16.6667%;
  }
  .mk-col-xl-6 {
    flex: 0 0 25%;
  }
  .mk-col-xl-8 {
    flex: 0 0 33.3333%;
  }
  .mk-col-xl-12 {
    flex: 0 0 50%;
  }
  .mk-col-xl-16 {
    flex: 0 0 66.6667%;
  }
  .mk-col-xl-24 {
    flex: 0 0 100%;
  }
}
</style>
