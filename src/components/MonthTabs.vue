<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

defineProps({
  months: { type: Array, required: true },
  selectedMonth: { type: String, required: true },
  expenses: { type: Object, required: true },
})
const emit = defineEmits(['select'])
const monthLabel = (month) => dayjs(`${month}-01`).locale('th').format('MMMM')
const scrollRef = ref(null)

function scrollTabs(direction) {
  if (scrollRef.value) {
    scrollRef.value.scrollBy({ left: direction * 200, behavior: 'smooth' })
  }
}
</script>

<template>
  <section class="month-row">
    <button class="month-nav-btn" @click="scrollTabs(-1)" aria-label="เลื่อนเดือนก่อนหน้า">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <div class="month-tabs-scroll" ref="scrollRef">
      <button v-for="month in months" :key="month" class="month-tab" :class="{ active: selectedMonth === month }" @click="emit('select', month)">
        <span>{{ monthLabel(month) }}</span><small>{{ expenses[month]?.length || 0 }} รายการ</small>
      </button>
    </div>
    <button class="month-nav-btn" @click="scrollTabs(1)" aria-label="เลื่อนเดือนถัดไป">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  </section>
</template>
