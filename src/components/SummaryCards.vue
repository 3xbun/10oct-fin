<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  month: { type: String, required: true },
  total: { type: Number, required: true },
  paidTotal: { type: Number, required: true },
  openTotal: { type: Number, required: true },
  progress: { type: Number, required: true },
  paidCount: { type: Number, required: true },
  openCount: { type: Number, required: true },
  formatMoney: { type: Function, required: true },
})
const monthLabel = (month) => dayjs(`${month}-01`).locale('th').format('MMMM')
const animatedTotal = ref(0)
const animatedPaidTotal = ref(0)
const animatedOpenTotal = ref(0)
const animatedProgress = ref(0)
let animationFrame

function animateValues(targets) {
  cancelAnimationFrame(animationFrame)
  const starts = { total: animatedTotal.value, paidTotal: animatedPaidTotal.value, openTotal: animatedOpenTotal.value, progress: animatedProgress.value }
  const startedAt = performance.now()
  const duration = 650
  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedTotal.value = starts.total + (targets.total - starts.total) * eased
    animatedPaidTotal.value = starts.paidTotal + (targets.paidTotal - starts.paidTotal) * eased
    animatedOpenTotal.value = starts.openTotal + (targets.openTotal - starts.openTotal) * eased
    animatedProgress.value = starts.progress + (targets.progress - starts.progress) * eased
    if (progress < 1) animationFrame = requestAnimationFrame(tick)
  }
  animationFrame = requestAnimationFrame(tick)
}

watch(() => [props.total, props.paidTotal, props.openTotal, props.progress], ([total, paidTotal, openTotal, progress]) => animateValues({ total, paidTotal, openTotal, progress }), { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(animationFrame))
</script>

<template>
  <section class="summary-grid">
    <div class="summary-card summary-main"><div><p class="label">รวมจ่ายเดือน {{ monthLabel(month) }}</p><strong>{{ formatMoney(Math.round(animatedTotal)) }} <small>฿</small></strong></div><div class="ring" :style="{ '--progress': `${animatedProgress * 3.6}deg` }"><span>{{ Math.round(animatedProgress) }}%</span></div></div>
    <div class="summary-card"><p class="label">จ่ายแล้ว</p><strong class="green">{{ formatMoney(Math.round(animatedPaidTotal)) }} <small>฿</small></strong><span class="summary-note">{{ paidCount }} รายการ</span></div>
    <div class="summary-card"><p class="label">ค้างจ่าย</p><strong class="coral">{{ formatMoney(Math.round(animatedOpenTotal)) }} <small>฿</small></strong><span class="summary-note">{{ openCount }} รายการ</span></div>
  </section>
</template>
