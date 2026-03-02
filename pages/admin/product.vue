<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex flex-col font-prompt">
    <Header />
    <div class="flex flex-1">
      <main class="flex-1 pt-20 max-w-3xl w-full mx-auto px-2 sm:px-4 md:px-8">
        <div class="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mb-10">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-green-700">รายการสินค้า</h2>
            <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-bold" @click="addProduct">เพิ่มสินค้า</button>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 mb-4">
            <select :value="selectedCategory" @change="selectCategory(Number($event.target.value))" class="border rounded px-2 py-1 w-full sm:w-auto">
              <option value="0">ทั้งหมด</option>
              <option value="1">อาหารแห้ง</option>
              <option value="2">เครื่องดื่ม</option>
              <option value="3">ของใช้</option>
            </select>
            <select v-model="sortType" class="border rounded px-2 py-1 w-full sm:w-auto">
              <option value="name">ชื่อ (ก-ฮ)</option>
              <option value="price-desc">ราคามากไปน้อย</option>
              <option value="price-asc">ราคาน้อยไปมาก</option>
              <option value="qty-desc">จำนวนมากไปน้อย</option>
              <option value="qty-asc">จำนวนน้อยไปมาก</option>
              <option value="created-desc">วันที่เพิ่มล่าสุด</option>
              <option value="created-asc">วันที่เพิ่มเก่าสุด</option>
              <option value="updated-desc">วันที่แก้ไขล่าสุด</option>
              <option value="updated-asc">วันที่แก้ไขเก่าสุด</option>
            </select>
            <input v-model="search" type="text" placeholder="ค้นหาสินค้า" class="border rounded px-2 py-1 flex-1" />
          </div>
          <ul>
            <li v-for="prod in pagedProducts" :key="prod.id" class="flex justify-between items-center border-b py-2">
              <div>
                <div class="font-semibold">{{ prod.name }}</div>
                <div class="text-sm text-gray-500">ราคา: ฿{{ prod.price }} | ต้นทุน: ฿{{ prod.cost }} | จำนวน: {{ prod.qty }}</div>
                <div class="text-xs text-gray-400">
                  เพิ่มเมื่อ: {{ prod.createdAt ? new Date(prod.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' }) : '-' }}<br>
                  แก้ไขล่าสุด: {{ prod.updatedAt ? new Date(prod.updatedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' }) : '-' }}
                </div>
              </div>
              <div class="flex gap-2">
                <button class="bg-yellow-400 text-white px-2 py-1 rounded" @click="editProduct(prod.id)">แก้ไข</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded" @click="confirmDelete(prod.id)">ลบ</button>
              </div>
            </li>
          </ul>
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6 mb-8">
            <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold" :disabled="page === 1" @click="goPrev">ก่อนหน้า</button>
            <span v-for="p in totalPages" :key="p">
              <button class="px-3 py-1 rounded font-bold" :class="p === page ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'" @click="goToPage(p)">{{ p }}</button>
            </span>
            <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold" :disabled="page === totalPages" @click="goNext">ถัดไป</button>
          </div>
          <!-- Edit/Add Modal -->
          <div v-if="showEdit" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
              <button class="absolute top-2 right-2 text-gray-500 hover:text-red-500" @click="cancelEdit">✕</button>
              <h3 class="text-xl font-bold mb-4 text-center">{{ editId === null ? 'เพิ่มสินค้า' : 'แก้ไขสินค้า' }}</h3>
              <div class="mb-3">
                <label class="block mb-1 font-bold">ชื่อสินค้า</label>
                <input v-model="editName" type="text" class="border rounded px-2 py-1 w-full" />
              </div>
              <div class="mb-3">
                <label class="block mb-1 font-bold">ราคา</label>
                <input v-model.number="editPrice" type="number" min="0" class="border rounded px-2 py-1 w-full" />
              </div>
              <div class="mb-3">
                <label class="block mb-1 font-bold">ต้นทุน</label>
                <input v-model.number="editCost" type="number" min="0" class="border rounded px-2 py-1 w-full" />
              </div>
              <div class="mb-3">
                <label class="block mb-1 font-bold">จำนวน</label>
                <input v-model.number="editQty" type="number" min="0" class="border rounded px-2 py-1 w-full" />
              </div>
              <div class="mb-3">
                <label class="block mb-1 font-bold" @click="focusPasteArea">รูปภาพสินค้า</label>
                <input type="file" accept="image/*" @change="onImageChange" class="border rounded px-2 py-1 w-full" ref="imgInput" />
                <div
                  ref="pasteArea"
                  contenteditable="true"
                  @paste="onImagePaste"
                  style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;"
                ></div>
                <div v-if="editImg" class="mt-2 flex justify-center" @click="focusPasteArea">
                  <img :src="editImg" alt="preview" class="max-h-32 rounded shadow cursor-pointer" />
                </div>
                <div v-else class="mt-2 flex justify-center">
                  <button type="button" class="bg-gray-100 px-4 py-2 rounded shadow text-gray-500" @click="focusPasteArea">คลิกหรือวางรูปภาพที่นี่</button>
                </div>
              </div>
              <div class="mb-3">
                <label class="block mb-1 font-bold">หมวดหมู่</label>
                <select v-model="editCategory" class="border rounded px-2 py-1 w-full">
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="flex gap-2 mt-4">
                <button class="bg-green-500 text-white px-4 py-2 rounded font-bold flex-1" @click="saveEdit">บันทึก</button>
                <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold flex-1" @click="cancelEdit">ยกเลิก</button>
              </div>
            </div>
          </div>
          <!-- Delete Confirmation Modal -->
          <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
              <button class="absolute top-2 right-2 text-gray-500 hover:text-red-500" @click="cancelDelete">✕</button>
              <h3 class="text-xl font-bold mb-4 text-center">ยืนยันการลบสินค้า</h3>
              <p class="mb-4 text-center text-gray-700">คุณต้องการลบสินค้านี้ออกจากระบบหรือไม่?</p>
              <div class="flex gap-2 mt-4 justify-center">
                <button class="bg-red-500 text-white px-4 py-2 rounded font-bold flex-1" @click="doDelete">ลบ</button>
                <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold flex-1" @click="cancelDelete">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
        <button class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-green-600 text-white rounded-full shadow-lg p-3 sm:p-4 z-40 flex items-center gap-2 hover:bg-green-700 transition-all border-2 border-white/80" @click="goHome">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 sm:w-7 sm:h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="hidden md:inline">ย้อนกลับหน้าแรก</span>
        </button>
      </main>
    </div>
  </div>
</template>

<script setup>
import { nextTick } from 'vue'
// Role check: prevent staff from accessing admin page
if (process.client) {
  const role = localStorage.getItem('role');
  if (role === 'staff') {
    window.location.href = '/staff-manager';
  }
}
import { ref, computed, watch, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import { useRouter } from '#app'
const router = useRouter()

const PRODUCT_KEY = 'products'
const CATEGORY_KEY = 'categories'
const defaultCategories = [
  { id: 0, name: 'ทั้งหมด' },
  { id: 1, name: 'อาหารแห้ง' },
  { id: 2, name: 'เครื่องดื่ม' },
  { id: 3, name: 'ของใช้' }
]
const defaultProducts = [
  // อาหารแห้ง
  { id: 1, name: 'ข้าวสาร', price: 199, cost: 130, qty: 100, category: 1, createdAt: '2026-02-01T09:00', updatedAt: '2026-02-01T09:00' },
  { id: 2, name: 'น้ำปลา', price: 32, cost: 24, qty: 50, category: 1, createdAt: '2026-02-01T09:10', updatedAt: '2026-02-01T09:10' },
  { id: 3, name: 'น้ำตาล', price: 22, cost: 14, qty: 70, category: 1, createdAt: '2026-02-01T09:20', updatedAt: '2026-02-01T09:20' },
  { id: 4, name: 'เกลือ', price: 18, cost: 11, qty: 60, category: 1, createdAt: '2026-02-01T09:30', updatedAt: '2026-02-01T09:30' },
  { id: 5, name: 'แป้ง', price: 25, cost: 15, qty: 80, category: 1, createdAt: '2026-02-01T09:40', updatedAt: '2026-02-01T09:40' },
  // เครื่องดื่ม
  { id: 6, name: 'โค้ก', price: 15, cost: 8, qty: 80, category: 2, createdAt: '2026-02-01T10:00', updatedAt: '2026-02-01T10:00' },
  { id: 7, name: 'เป๊ปซี่', price: 15, cost: 8, qty: 70, category: 2, createdAt: '2026-02-01T10:10', updatedAt: '2026-02-01T10:10' },
  { id: 8, name: 'น้ำเปล่า', price: 10, cost: 4, qty: 120, category: 2, createdAt: '2026-02-01T10:20', updatedAt: '2026-02-01T10:20' },
  { id: 9, name: 'ชาเขียว', price: 20, cost: 12, qty: 60, category: 2, createdAt: '2026-02-01T10:30', updatedAt: '2026-02-01T10:30' },
  { id: 10, name: 'นมกล่อง', price: 18, cost: 10, qty: 90, category: 2, createdAt: '2026-02-01T10:40', updatedAt: '2026-02-01T10:40' },
  // ของใช้
  { id: 11, name: 'สบู่', price: 25, cost: 15, qty: 60, category: 3, createdAt: '2026-02-01T11:00', updatedAt: '2026-02-01T11:00' },
  { id: 12, name: 'แชมพู', price: 49, cost: 25, qty: 40, category: 3, createdAt: '2026-02-01T11:10', updatedAt: '2026-02-01T11:10' },
  { id: 13, name: 'ยาสีฟัน', price: 29, cost: 18, qty: 50, category: 3, createdAt: '2026-02-01T11:20', updatedAt: '2026-02-01T11:20' },
  { id: 14, name: 'กระดาษทิชชู่', price: 79, cost: 53, qty: 100, category: 3, createdAt: '2026-02-01T11:30', updatedAt: '2026-02-01T11:30' },
  { id: 15, name: 'น้ำยาล้างจาน', price: 22, cost: 16, qty: 70, category: 3, createdAt: '2026-02-01T11:40', updatedAt: '2026-02-01T11:40' }
]
function loadProducts() {
  const data = localStorage.getItem(PRODUCT_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return [...defaultProducts]
    }
  }
  return [...defaultProducts]
}
function saveProducts(list) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(list))
}
function loadCategories() {
  const data = localStorage.getItem(CATEGORY_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return [...defaultCategories]
    }
  }
  return [...defaultCategories]
}

const categories = ref(loadCategories())
const selectedCategory = ref(0)
const products = ref(loadProducts())
const search = ref('')
const sortType = ref('name')

const filteredProducts = computed(() => {
  let list = products.value.filter(prod => {
    // เฉพาะ 'ทั้งหมด' ให้ไม่ filter category
    if (selectedCategory.value === 0) {
      return prod.name.includes(search.value)
    }
    return Number(prod.category) === Number(selectedCategory.value) && prod.name.includes(search.value)
  })
  // Sorting ตาม dropdown
  if (sortType.value === 'name') {
    list = list.slice().sort((a, b) => {
      // ถ้าเลือก 'ทั้งหมด' ให้เรียงตามหมวดหมู่ก่อน แล้วชื่อ
      if (selectedCategory.value === 0) {
        const categoryOrder = [1, 2, 3]
        const catA = categoryOrder.indexOf(a.category)
        const catB = categoryOrder.indexOf(b.category)
        if (catA !== catB) return catA - catB
        return a.name.localeCompare(b.name, 'th')
      }
      return a.name.localeCompare(b.name, 'th')
    })
  } else if (sortType.value === 'price-desc') {
    list = list.slice().sort((a, b) => b.price - a.price)
  } else if (sortType.value === 'price-asc') {
    list = list.slice().sort((a, b) => a.price - b.price)
  } else if (sortType.value === 'qty-desc') {
    list = list.slice().sort((a, b) => b.qty - a.qty)
  } else if (sortType.value === 'qty-asc') {
    list = list.slice().sort((a, b) => a.qty - b.qty)
  } else if (sortType.value === 'created-desc') {
    list = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortType.value === 'created-asc') {
    list = list.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else if (sortType.value === 'updated-desc') {
    list = list.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  } else if (sortType.value === 'updated-asc') {
    list = list.slice().sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
  }
  return list
})

const page = ref(1)
const pageSize = ref(8)
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize.value))
const pagedProducts = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredProducts.value.slice(start, start + pageSize.value)
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
watch([filteredProducts, pageSize], () => {
  page.value = 1
})

const showEdit = ref(false)
const editId = ref(null)
const editName = ref('')
const editPrice = ref(0)
const editCost = ref(0)
const editQty = ref(0)
const editCategory = ref(categories.value[0]?.id || 1)
const editImg = ref('')
const imgInput = ref(null)
const pasteArea = ref(null)
function focusPasteArea() {
  if (pasteArea.value) pasteArea.value.focus()
}
function onImagePaste(e) {
  const items = e.clipboardData && e.clipboardData.items
  if (!items) return
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      const reader = new FileReader()
      reader.onload = function(evt) {
        editImg.value = evt.target.result
      }
      reader.readAsDataURL(file)
      e.preventDefault()
      break
    }
  }
}

const showDeleteModal = ref(false)
const deleteId = ref(null)

function addProduct() {
  showEdit.value = true
  editId.value = null
  editName.value = ''
  editPrice.value = 0
  editCost.value = 0
  editQty.value = 0
  editCategory.value = categories.value[0]?.id || 1
  editImg.value = ''
  nextTick(() => {
    if (imgInput.value) imgInput.value.value = ''
  })
}
function editProduct(id) {
  const prod = products.value.find(p => p.id === id)
  if (prod) {
    showEdit.value = true
    editId.value = id
    editName.value = prod.name
    editPrice.value = prod.price
    editCost.value = prod.cost
    editQty.value = prod.qty
    editCategory.value = prod.category
    editImg.value = prod.img || ''
    nextTick(() => {
      if (imgInput.value) imgInput.value.value = ''
    })
  }
}
function onImageChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = function(evt) {
    editImg.value = evt.target.result
  }
  reader.readAsDataURL(file)
}
function confirmDelete(id) {
  showDeleteModal.value = true
  deleteId.value = id
}
function doDelete() {
  if (deleteId.value !== null) {
    products.value = products.value.filter(prod => prod.id !== deleteId.value)
    saveProducts(products.value)
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
    alert('กรุณากรอกชื่อสินค้า')
    return
  }
  const now = new Date().toISOString()
  if (editId.value === null) {
    // Add
    const newId = products.value.length ? Math.max(...products.value.map(p => p.id)) + 1 : 1
    products.value.push({
      id: newId,
      name: editName.value,
      price: editPrice.value,
      cost: editCost.value,
      qty: editQty.value,
      category: editCategory.value,
      img: editImg.value,
      createdAt: now,
      updatedAt: now
    })
  } else {
    // Edit
    const idx = products.value.findIndex(p => p.id === editId.value)
    if (idx !== -1) {
      const prod = products.value[idx]
      const changed = prod.name !== editName.value || prod.price !== editPrice.value || prod.cost !== editCost.value || prod.qty !== editQty.value || prod.category !== editCategory.value || prod.img !== editImg.value
      products.value[idx] = {
        ...prod,
        name: editName.value,
        price: editPrice.value,
        cost: editCost.value,
        qty: editQty.value,
        category: editCategory.value,
        img: editImg.value,
        updatedAt: changed ? now : prod.updatedAt
      }
    }
  }
  saveProducts(products.value)
  showEdit.value = false
}
function cancelEdit() {
  showEdit.value = false
}
function goHome() {
  router.push('/admin-manager')
}
function selectCategory(id) {
  selectedCategory.value = id
  page.value = 1
  if (id === 0) {
    products.value = loadProducts()
  }
}
</script>
