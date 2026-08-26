<script setup>
defineProps({ darkMode: { type: Boolean, required: true } })
const emit = defineEmits(['toggle-theme'])
</script>

<template>
  <header class="topbar">
    <div class="brand"><span class="brand-mark"><i class="fa-duotone fa-solid fa-wallet" aria-hidden="true"></i></span><span>10Oct - Finance</span></div>
    <div class="topbar-tools"><div class="topbar-date">2026 · monthly planner</div><button class="theme-toggle" :aria-label="darkMode ? 'เปิดโหมดสว่าง' : 'เปิดโหมดมืด'" :title="darkMode ? 'เปิดโหมดสว่าง' : 'เปิดโหมดมืด'" @click="emit('toggle-theme')"><i :class="darkMode ? 'fa-duotone fa-solid fa-sun-bright' : 'fa-duotone fa-solid fa-moon'" aria-hidden="true"></i></button></div>
  </header>
</template>
