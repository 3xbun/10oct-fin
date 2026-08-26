<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/th'

defineProps({
  months: { type: Array, required: true },
  selectedMonth: { type: String, required: true },
  expenses: { type: Object, required: true },
})
const emit = defineEmits(['select'])
const monthLabel = (month) => dayjs(`${month}-01`).locale('th').format('MMMM')
</script>

<template>
  <section class="month-row">
    <button v-for="month in months" :key="month" class="month-tab" :class="{ active: selectedMonth === month }" @click="emit('select', month)">
      <span>{{ monthLabel(month) }}</span><small>{{ expenses[month]?.length || 0 }} รายการ</small>
    </button>
  </section>
</template>
