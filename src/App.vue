<script setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import AppHeader from './components/AppHeader.vue'
import ExpenseForm from './components/ExpenseForm.vue'
import ExpenseList from './components/ExpenseList.vue'
import MonthTabs from './components/MonthTabs.vue'
import SummaryCards from './components/SummaryCards.vue'
import { createExpense, deleteExpense, listExpenses, listPayments, updateExpense } from './api'

dayjs.locale('th')

const months = computed(() => Array.from({ length: 8 }, (_, index) => dayjs().startOf('month').add(index - 1, 'month').format('YYYY-MM')))
const selectedMonth = ref(dayjs().startOf('month').format('YYYY-MM'))
const showForm = ref(false)
const editingId = ref(null)
const editDraft = ref(null)
const payments = ref([])
const loading = ref(true)
const error = ref('')
const darkMode = ref(localStorage.getItem('finance-theme') === 'dark')
watch(darkMode, (value) => { document.documentElement.dataset.theme = value ? 'dark' : 'light'; localStorage.setItem('finance-theme', value ? 'dark' : 'light') }, { immediate: true })

const expenses = ref([])
const monthDate = computed(() => dayjs(`${selectedMonth.value}-01`).format('YYYY-MM-DD'))
function isDueInMonth(expense, targetMonth) {
  if (!expense.date) return false
  const startDate = dayjs(expense.date).startOf('month')
  const targetDate = dayjs(targetMonth).startOf('month')
  if (!startDate.isValid() || targetDate.isBefore(startDate)) return false
  if (expense.type === 'one-off') return targetDate.isSame(startDate, 'month')
  if (expense.type !== 'installment' || !expense.installment_total) return true
  const elapsedMonths = targetDate.diff(startDate, 'month')
  return elapsedMonths < expense.installment_total
}
const monthCounts = computed(() => Object.fromEntries(months.value.map((month) => [month, expenses.value.filter((expense) => isDueInMonth(expense, month))])))
const currentExpenses = computed(() => expenses.value.filter((expense) => isDueInMonth(expense, monthDate.value)).map((expense) => {
  const payment = payments.value.find((item) => String(item.expense_id) === String(expense.id) && dayjs(item.payment_date).format('YYYY-MM') === dayjs(monthDate.value).format('YYYY-MM'))
  const installmentAmount = expense.type === 'installment' && expense.installment_total ? Math.ceil(expense.amount / expense.installment_total) : expense.amount
  const installmentNumber = expense.type === 'installment' ? dayjs(monthDate.value).startOf('month').diff(dayjs(expense.date).startOf('month'), 'month') + 1 : 0
  const normalizedTitle = expense.title?.trim().toUpperCase() || ''
  const isPaidDeduction = normalizedTitle.startsWith('[PAID]')
  const isDeduction = isPaidDeduction || normalizedTitle.startsWith('[KN]')
  return { ...expense, name: expense.title, amount: isDeduction ? -installmentAmount : installmentAmount, remaining: expense.type === 'installment' ? expense.installment_total : 0, installmentNumber, installmentTotal: expense.installment_total || 0, isDeduction, isPaidDeduction, paid: isPaidDeduction || Boolean(payment), paymentId: payment?.id, masterAmount: expense.amount }
}))
const titleCollator = new Intl.Collator(['th', 'en'], { numeric: true, sensitivity: 'base' })
const visibleExpenses = computed(() => currentExpenses.value
  .sort((first, second) => Number(first.isDeduction) - Number(second.isDeduction) || first.type.localeCompare(second.type) || titleCollator.compare(first.name || '', second.name || '')))
const total = computed(() => currentExpenses.value.filter((item) => !item.isDeduction).reduce((sum, item) => sum + item.amount, 0) - currentExpenses.value.filter((item) => item.isDeduction && !item.isPaidDeduction).reduce((sum, item) => sum + Math.abs(item.amount), 0))
const paidTotal = computed(() => currentExpenses.value.filter((item) => item.paid && !item.isDeduction).reduce((sum, item) => sum + item.amount, 0) + currentExpenses.value.filter((item) => item.isPaidDeduction).reduce((sum, item) => sum + Math.abs(item.amount), 0))
const openTotal = computed(() => total.value - paidTotal.value)
const progress = computed(() => total.value ? Math.round((paidTotal.value / total.value) * 100) : 0)
const formatMoney = (amount) => new Intl.NumberFormat('th-TH').format(amount)

const BANKS = ['TTB', 'KBank', 'SCB', 'BBL', 'KTC']
function addExpense(form) {
  createExpense({ Title: form.name, amount: Number(form.amount), type: form.type, note: form.note || null, bank: form.bank || null, active: true, date: monthDate.value, installment_total: form.type === 'installment' ? Number(form.months) || 1 : null }).then(loadData).catch(showError)
  showForm.value = false
}

function startEditing(item) {
  editingId.value = item.id
  editDraft.value = { ...item }
}

function cancelEditing() {
  editingId.value = null
  editDraft.value = null
}

function saveEditing() {
  if (!editDraft.value?.name || !editDraft.value?.amount) return
  const draft = editDraft.value
  // The row shows the per-month amount for installments (and negative for
  // [PAID]/[KN] deductions), so convert the edited value back to the stored
  // total. Using masterAmount here would always write back the old value.
  const base = Math.abs(Number(draft.amount)) || 0
  const months = Number(draft.installmentTotal) || 1
  const amount = draft.type === 'installment' ? base * months : base
  updateExpense(editingId.value, { Title: draft.name, amount, type: draft.type, note: draft.note || null, bank: draft.bank || null, installment_total: draft.type === 'installment' ? months : null }).then(() => { cancelEditing(); return loadData() }).catch(showError)
}

function duplicateExpense(item) {
  createExpense({ Title: item.name, amount: item.masterAmount || item.amount, type: item.type, note: item.note || null, bank: item.bank || null, active: true, date: monthDate.value, installment_total: item.type === 'installment' ? item.installmentTotal : null }).then(loadData).catch(showError)
}

function removeExpense(id) { deleteExpense(id).then(loadData).catch(showError) }
async function loadData() { loading.value = true; try { expenses.value = await listExpenses(); payments.value = await listPayments() } catch (loadError) { showError(loadError) } finally { loading.value = false } }
function showError(loadError) { error.value = loadError.message }
loadData()
</script>

<template>
  <main class="app-shell">
    <AppHeader :dark-mode="darkMode" class="animate__animated animate__fadeInDown" @toggle-theme="darkMode = !darkMode" />
    <section class="intro animate__animated animate__fadeInUp"><div><p class="eyebrow">OUR MONEY / 2026</p><h1>รายการใช้จ่าย<br /><em>ของผู้มีอันจะกิน</em></h1></div></section>
    <MonthTabs class="animate__animated animate__fadeInUp" :months="months" :selected-month="selectedMonth" :expenses="monthCounts" @select="selectedMonth = $event" />
    <p v-if="error" class="api-error">{{ error }}</p><p v-if="loading" class="loading-state">กำลังโหลดข้อมูล...</p>
    <Transition enter-active-class="animate__animated animate__fadeIn" leave-active-class="animate__animated animate__fadeOut"><ExpenseForm v-if="showForm" :banks="BANKS" @submit="addExpense" @close="showForm = false" /></Transition>
    <SummaryCards class="animate__animated animate__fadeInUp" :month="selectedMonth" :total="total" :paid-total="paidTotal" :open-total="openTotal" :progress="progress" :paid-count="currentExpenses.filter(item => item.paid).length" :open-count="currentExpenses.filter(item => !item.paid).length" :format-money="formatMoney" />
    <ExpenseList class="animate__animated animate__fadeInUp" :month="selectedMonth" :expenses="visibleExpenses" :banks="BANKS" :editing-id="editingId" :edit-draft="editDraft" @edit="startEditing" @save-edit="saveEditing" @cancel-edit="cancelEditing" @duplicate="duplicateExpense" @remove="removeExpense" @add="showForm = true" />
    <button class="floating-add animate__animated animate__fadeInUp" :aria-label="showForm ? 'ปิดแบบฟอร์มเพิ่มรายการ' : 'เพิ่มรายการ'" :title="showForm ? 'ปิดแบบฟอร์มเพิ่มรายการ' : 'เพิ่มรายการ'" @click="showForm = !showForm"><i :class="showForm ? 'fa-duotone fa-solid fa-xmark' : 'fa-duotone fa-solid fa-plus'" aria-hidden="true"></i><span>{{ showForm ? 'ปิด' : 'เพิ่มรายการ' }}</span></button>
    <footer><span>บันทึกอัตโนมัติในเครื่องนี้</span><span>อัปเดตล่าสุด · วันนี้</span></footer>
  </main>
</template>
