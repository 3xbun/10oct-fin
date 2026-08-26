<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/th'

defineProps({
  expenses: { type: Array, required: true },
  month: { type: String, required: true },
  filter: { type: String, required: true },
  editingId: { type: Number, default: null },
  editDraft: { type: Object, default: null },
})
const emit = defineEmits(['add', 'filter', 'toggle-paid', 'edit', 'save-edit', 'cancel-edit', 'duplicate', 'remove'])
const monthLabel = (month) => dayjs(`${month}-01`).locale('th').format('MMMM')
const typeIcon = (item) => item.isDeduction ? 'fa-arrow-down-left' : item.type === 'installment' ? 'fa-list-ol' : item.type === 'one-off' ? 'fa-receipt' : item.type === 'split' ? 'fa-money-bill-transfer' : 'fa-arrows-rotate'
const typeLabel = (item) => item.isPaidDeduction ? 'จ่ายแล้ว · หักจากยอดเดือนนี้' : item.isDeduction ? 'หักจากยอดเดือนนี้' : item.type === 'one-off' ? 'ครั้งเดียว' : item.type === 'split' ? 'แบ่งจ่าย' : 'ประจำ'
</script>

<template>
  <section class="list-section">
    <div class="list-heading"><div><p class="eyebrow">PAYMENT CHECKLIST</p><h2>รายการของเดือน {{ monthLabel(month) }}</h2></div><div class="filters"><button :class="{ selected: filter === 'all' }" @click="emit('filter', 'all')">ทั้งหมด</button><button :class="{ selected: filter === 'open' }" @click="emit('filter', 'open')">ยังไม่จ่าย</button><button :class="{ selected: filter === 'paid' }" @click="emit('filter', 'paid')">จ่ายแล้ว</button></div></div>
    <div v-if="expenses.length" class="expense-list">
      <article v-for="item in expenses" :key="item.id" class="expense-item" :class="{ completed: item.paid, editing: editingId === item.id }">
        <template v-if="editingId === item.id"><div class="edit-spacer"></div><div class="edit-fields"><input v-model="editDraft.name" aria-label="ชื่อรายการ" /><input v-model="editDraft.note" placeholder="หมายเหตุ" aria-label="หมายเหตุ" /></div><div class="edit-meta"><select v-model="editDraft.type" aria-label="ประเภท"><option value="fixed">ประจำ</option><option value="installment">ผ่อนชำระ</option><option value="one-off">ครั้งเดียว</option><option value="split">แบ่งจ่าย</option></select><input v-if="editDraft.type === 'installment'" v-model="editDraft.installmentTotal" type="number" min="1" aria-label="จำนวนงวดทั้งหมด" /></div><input v-model="editDraft.amount" class="edit-amount" type="number" min="0" aria-label="จำนวนเงิน" /><span class="edit-actions"><button title="บันทึกการแก้ไข" @click="emit('save-edit')"><i class="fa-duotone fa-solid fa-check" aria-hidden="true"></i></button><button title="ยกเลิกการแก้ไข" @click="emit('cancel-edit')"><i class="fa-duotone fa-solid fa-xmark" aria-hidden="true"></i></button></span></template>
        <template v-else><button class="check" :aria-label="item.paid ? 'ยกเลิกจ่ายแล้ว' : 'ทำเครื่องหมายว่าจ่ายแล้ว'" @click="emit('toggle-paid', item)"><i :class="item.paid ? 'fa-duotone fa-solid fa-square-check' : 'fa-duotone fa-regular fa-square'" aria-hidden="true"></i></button><div class="expense-name"><strong>{{ item.name }}</strong><span v-if="item.note">{{ item.note }}</span><span class="type-label" :class="[`type-${item.type}`, { installment: item.installmentTotal, deduction: item.isDeduction }]" :title="typeLabel(item)"><i class="fa-duotone fa-solid" :class="typeIcon(item)" aria-hidden="true"></i>{{ item.installmentTotal ? `ผ่อนชำระ · เดือนที่ ${item.installmentNumber}/${item.installmentTotal}` : typeLabel(item) }}</span></div><strong class="amount" :class="{ deduction: item.isDeduction }">{{ new Intl.NumberFormat('th-TH', { signDisplay: 'auto' }).format(item.amount) }} ฿</strong><span class="row-actions"><button title="แก้ไขรายการ" @click="emit('edit', item)"><i class="fa-duotone fa-solid fa-pen" aria-hidden="true"></i></button><button title="ทำสำเนารายการ" @click="emit('duplicate', item)"><i class="fa-duotone fa-solid fa-copy" aria-hidden="true"></i></button><button class="delete" aria-label="ลบรายการ" @click="emit('remove', item.id)"><i class="fa-duotone fa-solid fa-trash" aria-hidden="true"></i></button></span></template>
      </article>
    </div>
    <div v-else class="empty-state"><span><i class="fa-duotone fa-solid fa-clipboard-list" aria-hidden="true"></i></span><p>ยังไม่มีรายการในเดือนนี้</p><button @click="emit('add')"><i class="fa-duotone fa-solid fa-plus" aria-hidden="true"></i> เพิ่มรายการแรก</button></div>
  </section>
</template>
