<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits(['submit', 'close'])
defineProps({
  banks: { type: Array, default: () => [] },
})
const emptyForm = () => ({ name: '', amount: '', installmentValue: '', installmentMode: 'monthly', months: 1, type: 'one-off', bank: '', note: '' })
const form = ref(emptyForm())

function submit() {
  const value = form.value.type === 'installment' ? Number(form.value.installmentValue) : Number(form.value.amount)
  const months = Number(form.value.months)
  if (!form.value.name || !value || (form.value.type === 'installment' && !months)) return
  const amount = form.value.type === 'installment' && form.value.installmentMode === 'monthly' ? value * months : value
  emit('submit', { ...form.value, amount, months })
  form.value = emptyForm()
}

function closeOnEscape(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <div class="modal-backdrop" role="presentation" @click.self="emit('close')">
    <section class="expense-modal" role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
      <div class="modal-heading"><div><p class="eyebrow">NEW PAYMENT</p><h2 id="expense-modal-title">เพิ่มรายการ</h2></div><button class="modal-close" type="button" aria-label="ปิดหน้าต่าง" title="ปิด" @click="emit('close')"><i class="fa-duotone fa-solid fa-xmark" aria-hidden="true"></i></button></div>
      <form class="expense-form" @submit.prevent="submit">
        <input class="expense-name-input" v-model="form.name" placeholder="ชื่อรายการ" aria-label="ชื่อรายการ" autofocus />
        <select class="expense-type-select" v-model="form.type" aria-label="ประเภท"><option value="one-off">ครั้งเดียว</option><option value="fixed">ทุกเดือน</option><option value="installment">ผ่อนชำระ</option></select>
        <select class="expense-bank-select" v-model="form.bank" aria-label="ธนาคาร"><option value="" disabled>เลือกธนาคาร (ถ้ามี)</option><option v-for="bank in banks" :key="bank" :value="bank">{{ bank }}</option></select>
        <template v-if="form.type === 'installment'"><select class="installment-mode-select" v-model="form.installmentMode" aria-label="วิธีกรอกยอดผ่อน"><option value="monthly">ยอดต่อเดือน</option><option value="total">ยอดรวมทั้งหมด</option></select><input class="expense-amount-input" v-model="form.installmentValue" type="number" min="0" :placeholder="form.installmentMode === 'monthly' ? 'จ่ายเดือนละ' : 'ยอดซื้อทั้งหมด'" aria-label="ยอดผ่อน" /><input class="installment-months-input" v-model="form.months" type="number" min="1" placeholder="จำนวนเดือน" aria-label="จำนวนเดือน" /></template>
        <input v-else class="expense-amount-input" v-model="form.amount" type="number" min="0" placeholder="จำนวนเงิน" aria-label="จำนวนเงิน" />
        <input class="expense-note-input" v-model="form.note" placeholder="หมายเหตุ (ถ้ามี)" aria-label="หมายเหตุ" />
        <button class="expense-submit" type="submit">บันทึก</button>
      </form>
    </section>
  </div>
</template>
