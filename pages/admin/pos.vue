<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col font-prompt">
    <Header />
    <!-- Hamburger icon moved to sidebar header for mobile -->
    <Sidebar :show="showSidebar" @close="toggleSidebar" :categories="categories" @selectCategory="selectCategory" />
    <main class="flex-1 flex pt-8">
      <!-- Left: Product List by Category -->
      <section class="flex-1 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
          <label class="text-2xl font-bold flex-shrink-0">หมวดหมู่:</label>
          <select v-model="selectedCategory" class="border rounded px-2 py-1 text-base font-bold max-w-xs w-full sm:w-auto">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <input v-model="searchText" type="text" placeholder="ค้นหาสินค้า..." class="border rounded px-2 py-1 flex-1 max-w-xs w-full sm:w-auto" />
        </div>
        <div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 ml-2 mb">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-2 sm:p-2.5 flex flex-col items-center w-full max-w-[44vw] xs:max-w-[32vw] sm:max-w-[22vw] md:max-w-[160px] group cursor-pointer relative overflow-hidden"
          >
            <div class="w-full aspect-square flex items-center justify-center bg-gray-50 rounded-lg mb-2 overflow-hidden border border-gray-100">
              <img :src="product.img && typeof product.img === 'string' && product.img.trim() !== '' ? product.img : 'default.jpg'" alt="product image" class="object-contain w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 group-hover:scale-105 transition-transform duration-200" @error="event => event.target.src = 'default.jpg'" />
            </div>
            <div class="text-xs xs:text-sm sm:text-base md:text-lg font-bold mb-1 text-center line-clamp-2 min-h-[2.2em]">{{ product.name }}</div>
            <div class="text-blue-600 font-bold text-xs xs:text-sm sm:text-base md:text-lg mb-1">฿{{ product.price }}</div>
            <button
              class="mt-auto bg-blue-500 text-white px-2 xs:px-2.5 sm:px-3 py-1.5 rounded-md hover:bg-blue-600 font-bold shadow transition w-full text-xs xs:text-sm sm:text-base"
              @click="addToCart(product)"
            >
              เพิ่มลงรายการ
            </button>
          </div>
        </div>
      </section>
      <!-- Right: Cart Sidebar -->
      <aside v-if="showCartSidebar" class="w-full max-w-xs bg-white rounded-xl shadow p-4 ml-2 flex flex-col relative min-h-[80vh]">
        <button @click="toggleCartSidebar" class="absolute top-2 right-2 bg-gray-100 rounded-full p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-gray-700">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-2xl font-extrabold mb-6">รายการสินค้า</h3>
        <div class="mb-4">
          <div class="grid grid-cols-4 gap-3 font-extrabold text-base text-gray-700 mb-2">
            <div>ชื่อ</div>
            <div class="text-center">จำนวน</div>
            <div class="text-right">ราคา</div>
            <div></div>
          </div>
          <div v-for="item in cart" :key="item.id" class="grid grid-cols-4 gap-3 items-center text-base mb-2">
            <div class="truncate">{{ item.name }}</div>
            <div class="text-center">x{{ item.qty }}</div>
            <div class="text-right">฿{{ item.price * item.qty }}</div>
            <button class="text-red-500 text-sm font-bold border border-red-400 rounded px-2 py-0.5 hover:bg-red-50 transition" @click="removeFromCart(item.id)">ลบ</button>
          </div>
        </div>
        <div class="mt-6 border-t pt-6">
          <div class="flex justify-between font-extrabold text-xl mb-4">
            <span>ยอดรวม</span>
            <span>฿{{ total }}</span>
          </div>
          <label class="block text-base font-bold mb-1" for="discount-input">ส่วนลด</label>
          <input id="discount-input" v-model="discount" type="number" placeholder="โปรโมชั่น/ส่วนลด" class="mt-3 w-full border rounded px-3 py-2 text-base" />
          <div class="flex flex-wrap gap-3 mt-6">
            <button class="flex-1 min-w-[100px] flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 font-extrabold text-base transition" @click="showClearModal = true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" class="w-5 h-5">
                <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" stroke-width="2" />
                <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" stroke-width="2" />
              </svg>
              ลบทั้งหมด
            </button>
            <button class="flex-1 min-w-[100px] flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 font-extrabold text-base transition" @click="saveOrder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" class="w-5 h-5">
                <polyline points="4 10 8 14 16 6" fill="none" stroke="currentColor" stroke-width="2" />
              </svg>
              บันทึกรายการ
            </button>
            <button :disabled="cart.length === 0" :class="['flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow font-extrabold text-base transition', cart.length === 0 ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600']" @click="payOrder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" class="w-5 h-5">
                <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" stroke-width="2" />
              </svg>
              ชำระเงิน
            </button>
          </div>
        </div>
        <div v-if="showClearModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
            <button class="absolute top-2 right-2 text-gray-500 hover:text-red-500" @click="showClearModal = false">✕</button>
            <h3 class="text-xl font-bold mb-4 text-center">ยืนยันการลบทั้งหมด</h3>
            <p class="mb-4 text-center text-gray-700">คุณต้องการลบสินค้าทั้งหมดออกจากรายการหรือไม่?</p>
            <div class="flex gap-2 justify-center">
              <button class="bg-red-500 text-white px-4 py-2 rounded font-bold" @click="confirmClearCart">ลบทั้งหมด</button>
              <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold" @click="showClearModal = false">ยกเลิก</button>
            </div>
          </div>
        </div>
        <!-- Back to home button at the bottom of sidebar -->
        <button @click="goHome" class="mt-auto w-full bg-blue-500 text-white rounded-lg shadow p-3 font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับหน้าแรก
        </button>
      </aside>
      
      <button v-if="!showCartSidebar" @click="toggleCartSidebar" class="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full shadow p-4 z-40 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        เปิดรายการสินค้า
      </button>
    </main>
  </div>
</template>

<script setup>
// Role check: prevent staff from accessing admin POS page
if (process.client) {
  const role = localStorage.getItem('role');
  if (role === 'staff') {
    window.location.href = '/staff-manager';
  }
}
const showCartSidebar = ref(true)
function toggleCartSidebar() {
  showCartSidebar.value = !showCartSidebar.value
}
import { ref, computed } from 'vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'

const showSidebar = ref(false)
const categories = ref([
  { id: 1, name: 'อาหารแห้ง' },
  { id: 2, name: 'เครื่องดื่ม' },
  { id: 3, name: 'ของใช้' }
])
const selectedCategory = ref(categories.value[0].id)
const selectedCategoryName = computed(() => categories.value.find(c => c.id === selectedCategory.value)?.name || '')

const searchText = ref('')
const defaultProducts = [
  // อาหารแห้ง
  { id: 1, name: 'ข้าวสาร', price: 35, cost: 25, category: 1, img: '/rice.jpg' },
  { id: 2, name: 'น้ำปลา', price: 20, cost: 12, category: 1, img: '/fishsauce.jpg' },
  { id: 3, name: 'น้ำตาล', price: 18, cost: 10, category: 1, img: '/sugar.jpg' },
  { id: 4, name: 'เกลือ', price: 12, cost: 6, category: 1, img: '/salt.jpg' },
  { id: 5, name: 'แป้ง', price: 25, cost: 15, category: 1, img: '/flour.jpg' },
  // เครื่องดื่ม
  { id: 6, name: 'โค้ก', price: 15, cost: 8, category: 2, img: '/coke.jpg' },
  { id: 7, name: 'เป๊ปซี่', price: 15, cost: 8, category: 2, img: '/pepsi.jpg' },
  { id: 8, name: 'น้ำเปล่า', price: 10, cost: 4, category: 2, img: '/water.jpg' },
  { id: 9, name: 'ชาเขียว', price: 20, cost: 12, category: 2, img: '/greentea.jpg' },
  { id: 10, name: 'นมกล่อง', price: 18, cost: 10, category: 2, img: '/milk.jpg' },
  // ของใช้
  { id: 11, name: 'สบู่', price: 25, cost: 15, category: 3, img: '/soap.jpg' },
  { id: 12, name: 'แชมพู', price: 40, cost: 25, category: 3, img: '/shampoo.jpg' },
  { id: 13, name: 'ยาสีฟัน', price: 30, cost: 18, category: 3, img: '/toothpaste.jpg' },
  { id: 14, name: 'กระดาษทิชชู่', price: 22, cost: 12, category: 3, img: '/tissue.jpg' },
  { id: 15, name: 'น้ำยาล้างจาน', price: 28, cost: 16, category: 3, img: '/dishsoap.jpg' }
]
const products = ref([])

// โหลด products จาก localStorage ถ้ามี ถ้าไม่มีก็ใช้ default
if (localStorage.getItem('products')) {
  try {
    products.value = JSON.parse(localStorage.getItem('products'))
  } catch {
    products.value = defaultProducts
  }
} else {
  products.value = defaultProducts
}

// อัปเดต localStorage ทุกครั้งที่ products เปลี่ยน
watch(products, (val) => {
  localStorage.setItem('products', JSON.stringify(val))
}, { deep: true })
const filteredProducts = computed(() => {
  return products.value
    .filter(p =>
      p.category === selectedCategory.value &&
      (!searchText.value || p.name.toLowerCase().includes(searchText.value.toLowerCase()))
    )
    .sort((a, b) => a.price - b.price)
})

const cart = ref([])
const discount = ref(0)
const total = computed(() => {
  const sum = cart.value.reduce((acc, item) => acc + item.price * item.qty, 0)
  return sum - (discount.value || 0)
})

const showClearModal = ref(false)
function confirmClearCart() {
  cart.value = [];
  localStorage.removeItem('cart');
  showClearModal.value = false;
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}
function selectCategory(id) {
  selectedCategory.value = id
}
function addToCart(product) {
  const found = cart.value.find(item => item.id === product.id)
  if (found) {
    found.qty += 1
  } else {
    cart.value.push({ ...product, qty: 1 })
  }
  localStorage.setItem('cart', JSON.stringify(cart.value))
}
function removeFromCart(id) {
  cart.value = cart.value.filter(item => item.id !== id)
  localStorage.setItem('cart', JSON.stringify(cart.value))
}
function saveOrder() {
  // Save order logic
  localStorage.setItem('order', JSON.stringify(cart.value))
  alert('บันทึกรายการเรียบร้อย')
}
function payOrder() {
  // Payment logic
  localStorage.setItem('order', JSON.stringify(cart.value))
  router.push('/admin/payment')
}

function goHome() {
  router.push('/admin-manager')
}

import { useRouter } from '#app'
const router = useRouter()
// โหลด cart จาก localStorage เมื่อเข้า
if (localStorage.getItem('cart')) {
  try {
    cart.value = JSON.parse(localStorage.getItem('cart'))
  } catch {}
}

// Fix hamburger icon for small screens
// Move to top-4 left-4, z-50, and ensure not overlapping
</script>
