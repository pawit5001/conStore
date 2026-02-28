<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex flex-col font-prompt overflow-x-auto">
    <Header />
    <div class="flex flex-1 overflow-x-auto">
      <main class="flex-1 pt-16 sm:pt-20 max-w-full sm:max-w-4xl w-full mx-auto px-1 xs:px-2 sm:px-4 md:px-8 overflow-x-auto">
        <div class="bg-white rounded-2xl shadow-2xl p-2 xs:p-4 sm:p-6 md:p-8 max-w-full w-full break-words overflow-x-auto mb-10">
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6">
            <h2 class="text-xl xs:text-2xl font-bold text-pink-700 text-center sm:text-left">รายการยอดขาย</h2>
            <!-- ไม่มีปุ่มเพิ่มรายการ -->
          </div>
          <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:gap-2">
            <input v-model="search" type="text" placeholder="ค้นหารายการ" class="border rounded px-2 py-1 flex-1 min-w-0 w-full sm:w-auto" />
            <input v-model="searchDate" type="date" class="border rounded px-2 py-1 min-w-0 w-full sm:w-auto" />
            <select v-model="sortType" class="border rounded px-2 py-1 min-w-0 w-full sm:w-auto">
              <option value="date-desc">วันที่ล่าสุด</option>
              <option value="date-asc">วันที่เก่าสุด</option>
              <option value="order">เลข Order</option>
              <option value="total-desc">ยอดขายมากไปน้อย</option>
              <option value="total-asc">ยอดขายน้อยไปมาก</option>
            </select>
          </div>
          <ul class="divide-y">
    <li v-for="item in pagedProfits" :key="item.id" class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center border-b py-2">
      <div class="flex-1 min-w-0 break-words">
        <div class="font-semibold break-all text-base xs:text-lg">{{ item.name }}</div>
        <div class="text-xs sm:text-sm text-gray-500 w-full">
          <div v-for="prod in item.items" :key="prod.name + prod.price" class="flex justify-between gap-2 flex-wrap">
            <span class="truncate max-w-[60vw] sm:max-w-xs break-words">{{ prod.name }} x{{ prod.qty }}</span>
            <span class="whitespace-nowrap">฿{{ prod.price * prod.qty }} | กำไร ฿{{ (prod.price - (prod.cost || 0)) * prod.qty }}</span>
          </div>
          <div class="flex flex-row flex-wrap gap-1 mt-1 items-center w-full text-xs">
            <span class="whitespace-nowrap text-base">รวม: ฿{{ item.total }}</span>
            <span class="font-bold text-pink-700 whitespace-nowrap text-base">กำไร: ฿{{ item.profit }}</span>
            <span class="whitespace-nowrap text-base">{{ item.payType }}</span>
            <span class="whitespace-nowrap text-base">| {{ item.datetime ? new Date(item.datetime).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' }) : '' }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-2 flex-shrink-0 justify-end">
        <!-- ไม่มีปุ่มแก้ไข/ลบ -->
      </div>
    </li>
          </ul>
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex flex-wrap justify-center items-center gap-1 xs:gap-2 mt-6">
            <button class="px-2 xs:px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold" :disabled="page === 1" @click="goPrev">ก่อนหน้า</button>
            <span v-for="p in totalPages" :key="p">
              <button class="px-2 xs:px-3 py-1 rounded font-bold" :class="p === page ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'" @click="goToPage(p)">{{ p }}</button>
            </span>
            <button class="px-2 xs:px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold" :disabled="page === totalPages" @click="goNext">ถัดไป</button>
          </div>
          <!-- ไม่มี modal สำหรับ staff -->
        </div>
        <button class="fixed bottom-3 right-3 xs:bottom-4 xs:right-4 sm:bottom-6 sm:right-6 bg-pink-500 text-white rounded-full shadow-lg p-2 xs:p-3 sm:p-4 z-40 flex items-center gap-1 xs:gap-2 hover:bg-pink-600 transition-all border-2 border-white/80" @click="goHome">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="hidden md:inline">ย้อนกลับหน้าแรก</span>
        </button>
      </main>
    </div>
  </div>
</template>

<script setup>
// Role check: prevent admin from accessing staff page
if (process.client) {
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    window.location.href = '/admin-manager';
  }
}
import { ref, computed, watch } from 'vue'
import Header from '@/components/Header.vue'
import { useRouter } from '#app'
const router = useRouter()

const PROFIT_KEY = 'profits'
const defaultProfits = [
  { id: 1, name: 'ORD-20260225-0001', items: [
    { name: 'ข้าวสาร', qty: 2, price: 35, cost: 15 },
    { name: 'โค้ก', qty: 1, price: 15, cost: 8 }
  ], total: 85, profit: 47, payType: 'เงินสด', status: 'active', datetime: '2026-02-25T09:00' },
  { id: 2, name: 'ORD-20260225-0002', items: [
    { name: 'โค้ก', qty: 3, price: 15, cost: 8 },
    { name: 'น้ำเปล่า', qty: 2, price: 10, cost: 4 }
  ], total: 65, profit: 29, payType: 'พร้อมเพย์', status: 'inactive', datetime: '2026-02-25T10:30' }
]
function loadProfits() {
  const data = localStorage.getItem(PROFIT_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return [...defaultProfits]
    }
  }
  return [...defaultProfits]
}
function saveProfits(list) {
  localStorage.setItem(PROFIT_KEY, JSON.stringify(list))
}

const profits = ref(loadProfits())
const search = ref('')
const searchDate = ref('')
const sortType = ref('date-desc') // ค่าเริ่มต้นคือวันที่ล่าสุด

const filteredProfits = computed(() => {
  let list = profits.value.filter(item => {
    const matchesSearch = item.name.includes(search.value)
    const matchesDate = !searchDate.value || (item.datetime && item.datetime.slice(0,10) === searchDate.value)
    return matchesSearch && matchesDate
  })
  // Sorting
  if (sortType.value === 'date-desc') {
    list = list.slice().sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
  } else if (sortType.value === 'date-asc') {
    list = list.slice().sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  } else if (sortType.value === 'order') {
    list = list.slice().sort((a, b) => a.name.localeCompare(b.name, 'th', { numeric: true }))
  } else if (sortType.value === 'total-desc') {
    list = list.slice().sort((a, b) => b.total - a.total)
  } else if (sortType.value === 'total-asc') {
    list = list.slice().sort((a, b) => a.total - b.total)
  }
  return list
})

const page = ref(1)
const pageSize = ref(8)
const totalPages = computed(() => Math.ceil(filteredProfits.value.length / pageSize.value))
const pagedProfits = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredProfits.value.slice(start, start + pageSize.value)
})
function goPrev() {
  if (page.value > 1) page.value--
}
function goNext() {
  if (page.value < totalPages.value) page.value++
}
function goToPage(p) {
  page.value = p
}
watch([filteredProfits, pageSize], () => {
  page.value = 1
})

const showEdit = ref(false)
const editId = ref(null)
const editName = ref('')
// Remove unused single item fields (editQty, editPrice, editCost)
const editItems = ref([])
const editTotal = ref(0)
const editProfit = ref(0)
const editPayType = ref('เงินสด')
const editStatus = ref('active')
const editDatetime = ref(new Date().toISOString().slice(0,16))

const showDeleteModal = ref(false)
const deleteId = ref(null)

function addProfit() {
  showEdit.value = true
  editId.value = null
  editName.value = generateOrderCode()
  editItems.value = []
  editTotal.value = 0
  editProfit.value = 0
  editPayType.value = 'เงินสด'
  editStatus.value = 'active'
  editDatetime.value = new Date().toISOString().slice(0,16)
}
function editProfitFn(id) {
  const item = profits.value.find(i => i.id === id)
  if (item) {
    showEdit.value = true
    editId.value = id
    editName.value = item.name
    // Deep copy items with all fields
    editItems.value = item.items.map(prod => ({
      name: prod.name,
      qty: prod.qty,
      price: prod.price,
      cost: prod.cost || 0
    }))
    editTotal.value = item.total
    editProfit.value = item.profit
    editPayType.value = item.payType
    editStatus.value = item.status
    editDatetime.value = item.datetime || new Date().toISOString().slice(0,16)
  }
}
function confirmDelete(id) {
  showDeleteModal.value = true
  deleteId.value = id
}
function doDelete() {
  if (deleteId.value !== null) {
    profits.value = profits.value.filter(item => item.id !== deleteId.value)
    saveProfits(profits.value)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profit-updated'));
    }
    showDeleteModal.value = false
    deleteId.value = null
  }
}
function cancelDelete() {
  showDeleteModal.value = false
  deleteId.value = null
}
function saveEdit() {
  if (!editName.value.trim()) {
    alert('กรุณากรอกรหัสรายการ')
    return
  }
  if (!editItems.value.length) {
    alert('ต้องมีสินค้าอย่างน้อย 1 รายการ')
    return
  }
  // Validate all items
  for (const prod of editItems.value) {
    if (!prod.name.trim() || prod.qty < 1 || prod.price < 0 || prod.cost < 0) {
      alert('กรุณากรอกข้อมูลสินค้าให้ครบถ้วนและถูกต้อง')
      return
    }
  }
  // คำนวณ total/profit ใหม่
  editTotal.value = editItems.value.reduce((sum, i) => sum + (i.price * i.qty), 0)
  editProfit.value = editItems.value.reduce((sum, i) => sum + ((i.price - (i.cost || 0)) * i.qty), 0)
  if (editId.value === null) {
    // Add
    const newId = profits.value.length ? Math.max(...profits.value.map(i => i.id)) + 1 : 1
    const orderCode = generateOrderCode()
    profits.value.push({
      id: newId,
      name: orderCode,
      items: editItems.value.map(prod => ({
        name: prod.name,
        qty: prod.qty,
        price: prod.price,
        cost: prod.cost || 0
      })),
      total: editTotal.value,
      profit: editProfit.value,
      payType: editPayType.value,
      status: editStatus.value,
      datetime: editDatetime.value
    })
  } else {
    // Edit
    const idx = profits.value.findIndex(i => i.id === editId.value)
    if (idx !== -1) {
      profits.value[idx] = {
        id: editId.value,
        name: profits.value[idx].name, // keep original order code
        items: editItems.value.map(prod => ({
          name: prod.name,
          qty: prod.qty,
          price: prod.price,
          cost: prod.cost || 0
        })),
        total: editTotal.value,
        profit: editProfit.value,
        payType: editPayType.value,
        status: editStatus.value,
        datetime: editDatetime.value
      }
    }
  }
  saveProfits(profits.value)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('profit-updated'));
  }
  showEdit.value = false
}
function cancelEdit() {
  showEdit.value = false
}
function goHome() {
  router.push('/staff-manager')
}
// Auto-import from localStorage order (POS) if exists
function importOrderToProfits() {
  if (localStorage.getItem('order_paid')) {
    try {
      const order = JSON.parse(localStorage.getItem('order_paid'))
      if (Array.isArray(order) && order.length > 0) {
        // Group all items as 1 order
        // Use Asia/Bangkok local time for datetime
        const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T').slice(0,16)
        const orderCode = generateOrderCode()
        const total = order.reduce((sum, item) => sum + (item.price * item.qty), 0)
        const profit = order.reduce((sum, item) => sum + ((item.price - (item.cost || 0)) * item.qty), 0)
        const payType = order[0]?.payType || 'เงินสด'
        // Prevent duplicate by order code and datetime
        if (!profits.value.some(p => p.name === orderCode && p.datetime === now)) {
          profits.value.push({
            id: profits.value.length ? Math.max(...profits.value.map(i => i.id)) + 1 : 1,
            name: orderCode,
            items: order.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
            total,
            profit,
            payType,
            status: 'active',
            datetime: now
          })
        }
        saveProfits(profits.value)
        localStorage.removeItem('order_paid')
      }
    } catch {}
  }
}

// Run import and emit event if new profit is added
const beforeCount = profits.value.length;
importOrderToProfits();
if (profits.value.length > beforeCount && typeof window !== 'undefined') {
  window.dispatchEvent(new Event('profit-updated'));
}

// --- Utility functions must be inside <script setup> ---
function generateOrderCode() {
  const date = new Date().toISOString().slice(0,10).replace(/-/g, '')
  const seq = (profits.value.length + 1).toString().padStart(4, '0')
  return `ORD-${date}-${seq}`
}

function addItem() {
  editItems.value.push({ name: '', qty: 1, price: 0, cost: 0 })
}
function removeItem(idx) {
  editItems.value.splice(idx, 1)
}
</script>