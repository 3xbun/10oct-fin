<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { bankLogo } from '../banks'

defineProps({
  expenses: { type: Array, required: true },
  month: { type: String, required: true },
  banks: { type: Array, default: () => [] },
  editingId: { type: Number, default: null },
  editDraft: { type: Object, default: null },
})
const emit = defineEmits(['add', 'edit', 'save-edit', 'cancel-edit', 'duplicate', 'remove'])
const monthLabel = (month) => dayjs(`${month}-01`).locale('th').format('MMMM')
const typeIcon = (item) => item.type === 'installment' ? 'fa-list-ol' : item.type === 'one-off' ? 'fa-receipt' : item.type === 'split' ? 'fa-money-bill-transfer' : 'fa-arrows-rotate'
const typeLabel = (item) => item.isPaidDeduction ? 'จ่ายแล้ว · หักจากยอดเดือนนี้' : item.isDeduction ? 'หักจากยอดเดือนนี้' : item.type === 'one-off' ? 'ครั้งเดียว' : item.type === 'split' ? 'แบ่งจ่าย' : 'ประจำ'
const formatSign = (amount) => new Intl.NumberFormat('th-TH', { signDisplay: 'auto' }).format(amount)
const expensesOpen = ref(true)
const deductionsOpen = ref(true)
</script>

<template>
  <section class="list-section">
    <div class="list-heading">
      <div>
        <h2>รายการของเดือน {{ monthLabel(month) }}</h2>
      </div>
    </div>
    <div v-if="expenses.length" class="finance-table">
      <div class="finance-col finance-expenses">
        <div class="finance-col-header">
          <span class="eyebrow">ค่าใช้จ่าย</span>
          <span class="finance-col-count">{{ expenses.filter(i => !i.isDeduction).length }} รายการ</span>
          <button class="finance-toggle" :aria-label="expensesOpen ? 'ย่อค่าใช้จ่าย' : 'ขยายค่าใช้จ่าย'" @click="expensesOpen = !expensesOpen"><i class="fa-solid" :class="expensesOpen ? 'fa-angle-up' : 'fa-angle-down'" aria-hidden="true"></i></button>
        </div>
        <template v-if="expensesOpen">
          <article v-for="item in expenses.filter(i => !i.isDeduction)" :key="item.id" class="finance-row"
            :class="{ editing: editingId === item.id }">
            <template v-if="editingId === item.id">
              <div class="finance-row-edit">
                <div class="edit-fields"><input v-model="editDraft.name" aria-label="ชื่อรายการ" /><input
                    v-model="editDraft.note" placeholder="หมายเหตุ" aria-label="หมายเหตุ" /></div>
                <div class="edit-meta"><select v-model="editDraft.type" aria-label="ประเภท">
                    <option value="fixed">ประจำ</option>
                    <option value="installment">ผ่อนชำระ</option>
                    <option value="one-off">ครั้งเดียว</option>
                    <option value="split">แบ่งจ่าย</option>
                  </select><select v-model="editDraft.bank" class="edit-bank-select" aria-label="ธนาคาร"><option value="">ธนาคาร (ถ้ามี)</option>
                    <option v-for="bank in banks" :key="bank.value" :value="bank.value">{{ bank.label }}</option>
                  </select><input v-if="editDraft.type === 'installment'" v-model="editDraft.installmentTotal"
                    type="number" min="1" aria-label="จำนวนงวดทั้งหมด" /></div>
                <input v-model="editDraft.amount" class="edit-amount" type="number" min="0" aria-label="จำนวนเงิน" />
                <span class="edit-actions"><button title="บันทึกการแก้ไข" @click="emit('save-edit')"><i
                      class="fa-duotone fa-solid fa-check" aria-hidden="true"></i></button><button title="ยกเลิกการแก้ไข"
                      @click="emit('cancel-edit')"><i class="fa-duotone fa-solid fa-xmark"
                        aria-hidden="true"></i></button></span>
              </div>
            </template>
            <template v-else>
              <div class="finance-row-info">
                <strong>{{ item.name }}</strong>
                <span v-if="item.note" class="finance-note">{{ item.note }}</span>
                <span class="row-meta">
                  <span v-if="item.bank" class="bank-badge" :title="item.bank"><img v-if="bankLogo(item.bank)" :src="bankLogo(item.bank)" :alt="item.bank" /><template v-else>{{ item.bank }}</template></span>
                <span class="type-label" :class="`type-${item.type}`" :title="typeLabel(item)"><i
                    class="fa-duotone fa-solid" :class="typeIcon(item)" aria-hidden="true"></i>{{ item.installmentTotal ?
                      `ผ่อน · ${item.installmentNumber}/${item.installmentTotal}` : typeLabel(item) }}</span>
                </span>
              </div>
              <div class="finance-row-right">
                <strong class="amount">{{ formatSign(item.amount) }} ฿</strong>
                <span class="row-actions"><button title="แก้ไขรายการ" @click="emit('edit', item)"><i
                      class="fa-duotone fa-solid fa-pen" aria-hidden="true"></i></button><button title="ทำสำเนารายการ"
                    @click="emit('duplicate', item)"><i class="fa-duotone fa-solid fa-copy"
                      aria-hidden="true"></i></button><button class="delete" aria-label="ลบรายการ"
                    @click="emit('remove', item.id)"><i class="fa-duotone fa-solid fa-trash"
                      aria-hidden="true"></i></button></span>
              </div>
            </template>
          </article>
          <div v-if="!expenses.filter(i => !i.isDeduction).length" class="finance-empty">ไม่มีรายการค่าใช้จ่าย</div>
        </template>
      </div>
      <div class="finance-divider"></div>
      <div class="finance-col finance-deductions">
        <div class="finance-col-header">
          <span class="eyebrow">หักลดยอด · จ่ายแล้ว</span>
          <span class="finance-col-count">{{ expenses.filter(i => i.isDeduction).length }} รายการ</span>
          <button class="finance-toggle" :aria-label="deductionsOpen ? 'ย่อหักลดยอด' : 'ขยายหักลดยอด'" @click="deductionsOpen = !deductionsOpen"><i class="fa-solid" :class="deductionsOpen ? 'fa-angle-up' : 'fa-angle-down'" aria-hidden="true"></i></button>
        </div>
        <template v-if="deductionsOpen">
          <article v-for="item in expenses.filter(i => i.isDeduction)" :key="item.id" class="finance-row deduction-row"
            :class="{ editing: editingId === item.id }">
            <template v-if="editingId === item.id">
              <div class="finance-row-edit">
                <div class="edit-fields"><input v-model="editDraft.name" aria-label="ชื่อรายการ" /><input
                    v-model="editDraft.note" placeholder="หมายเหตุ" aria-label="หมายเหตุ" /></div>
                <div class="edit-meta"><select v-model="editDraft.type" aria-label="ประเภท">
                    <option value="fixed">ประจำ</option>
                    <option value="installment">ผ่อนชำระ</option>
                    <option value="one-off">ครั้งเดียว</option>
                    <option value="split">แบ่งจ่าย</option>
                  </select></div>
                <input v-model="editDraft.amount" class="edit-amount" type="number" min="0" aria-label="จำนวนเงิน" />
                <span class="edit-actions"><button title="บันทึกการแก้ไข" @click="emit('save-edit')"><i
                      class="fa-duotone fa-solid fa-check" aria-hidden="true"></i></button><button title="ยกเลิกการแก้ไข"
                      @click="emit('cancel-edit')"><i class="fa-duotone fa-solid fa-xmark"
                        aria-hidden="true"></i></button></span>
              </div>
            </template>
            <template v-else>
              <div class="finance-row-info">
                <strong>{{ item.name }}</strong>
                <span v-if="item.note" class="finance-note">{{ item.note }}</span>
                <span class="row-meta">
                  <span v-if="item.bank" class="bank-badge" :title="item.bank"><img v-if="bankLogo(item.bank)" :src="bankLogo(item.bank)" :alt="item.bank" /><template v-else>{{ item.bank }}</template></span>
                <span class="type-label deduction" :title="typeLabel(item)"><i
                    class="fa-duotone fa-solid fa-arrow-down-left" aria-hidden="true"></i>{{ typeLabel(item) }}</span>
                </span>
              </div>
              <div class="finance-row-right">
                <strong class="amount deduction">{{ formatSign(item.amount) }} ฿</strong>
                <span class="row-actions"><button title="แก้ไขรายการ" @click="emit('edit', item)"><i
                      class="fa-duotone fa-solid fa-pen" aria-hidden="true"></i></button><button title="ทำสำเนารายการ"
                    @click="emit('duplicate', item)"><i class="fa-duotone fa-solid fa-copy"
                      aria-hidden="true"></i></button><button class="delete" aria-label="ลบรายการ"
                    @click="emit('remove', item.id)"><i class="fa-duotone fa-solid fa-trash"
                      aria-hidden="true"></i></button></span>
              </div>
            </template>
          </article>
          <div v-if="!expenses.filter(i => i.isDeduction).length" class="finance-empty">ไม่มีรายการหักลด</div>
        </template>
      </div>
    </div>
    <div v-else class="empty-state"><span><i class="fa-duotone fa-solid fa-clipboard-list"
          aria-hidden="true"></i></span>
      <p>ยังไม่มีรายการในเดือนนี้</p><button @click="emit('add')"><i class="fa-duotone fa-solid fa-plus"
          aria-hidden="true"></i> เพิ่มรายการแรก</button>
    </div>
  </section>
</template>
