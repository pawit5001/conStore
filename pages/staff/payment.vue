<template>
  <div class="min-h-screen bg-gray-100 flex flex-col font-prompt">
    <Header />
    <main class="flex-1 flex flex-col items-center pt-8">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-auto mt-0">
        <h2 class="text-3xl font-extrabold mb-6 text-center">หน้าชำระเงิน</h2>
        <div class="flex flex-col items-center mb-6">
          <div class="bg-gray-200 rounded-xl p-6 w-full text-center text-3xl font-extrabold mb-4">฿{{ totalAmount }}</div>
          <div class="flex gap-3 mb-4 w-full">
            <button
              :disabled="paid"
              :class="['flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-lg transition', paid ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600']"
              @click="payCash"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" class="w-4 h-4">
                <rect x="4" y="8" width="12" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
                <line x1="10" y1="8" x2="10" y2="14" stroke="currentColor" stroke-width="2" />
              </svg>
              ชำระเงินสด
            </button>
            <button
              :disabled="paid"
              :class="['flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-lg transition', paid ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600']"
              @click="payPromptPay"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" class="w-4 h-4">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2" />
                <polyline points="7 10 10 13 13 7" fill="none" stroke="currentColor" stroke-width="2" />
              </svg>
              พร้อมเพย์
            </button>
          </div>
        </div>
        <!-- Back to POS button as icon, bottom-right -->
        <button v-if="!paid" class="fixed bottom-6 right-6 bg-gray-300 text-gray-700 rounded-full shadow p-4 z-40 flex items-center gap-2 text-lg font-bold" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="hidden md:inline">ย้อนกลับ</span>
        </button>
        <div v-if="showCash" class="bg-gray-100 rounded-xl p-6 mb-4">
          <div class="mb-3 font-bold text-xl">เงินสด</div>
          <div class="flex gap-2 mb-3 flex-wrap">
            <button v-for="amount in cashQuickButtons" :key="amount" class="bg-gray-200 px-4 py-2 rounded-lg font-bold text-lg" @click="addCash(amount)" :disabled="paid">฿{{ amount.toLocaleString() }}</button>
          </div>
          <input v-model="cashInput" type="number" min="totalAmount" placeholder="จำนวนเงินที่รับมา" class="border rounded px-3 py-2 w-full mb-3 text-lg" :disabled="paid" />
          <div v-if="showCash && cashInput && Number(cashInput) >= totalAmount && !paid" class="mb-3 text-green-700 font-bold text-lg">
            เงินทอน: ฿{{ Number(cashInput) - totalAmount }}
          </div>
          <div v-if="cashInput && Number(cashInput) < totalAmount" class="mb-3 text-red-600 font-bold text-lg">
            จำนวนเงินต้องไม่น้อยกว่ายอดชำระ
          </div>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded-lg font-bold w-full text-lg transition"
            :disabled="Number(cashInput) < totalAmount || paid || loadingCash"
            :class="[Number(cashInput) < totalAmount || paid || loadingCash ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600']"
            @click="confirmCash"
          >
            <span v-if="loadingCash" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              กำลังดำเนินการ...
            </span>
            <span v-else>ชำระเงิน</span>
          </button>
        </div>
        <div v-if="showPromptPay" class="bg-gray-100 rounded-xl p-6 mb-4">
          <div class="mb-3 font-bold text-xl">พร้อมเพย์</div>
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold w-full text-lg transition"
            :disabled="loadingPromptPay || paid"
            :class="[loadingPromptPay || paid ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600']"
            @click="confirmPromptPay"
          >
            <span v-if="loadingPromptPay" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              กำลังตรวจสอบ...
            </span>
            <span v-else>ตรวจสอบการชำระเงิน</span>
          </button>
        </div>
        <div v-if="paid" class="mt-6 text-center text-green-600 font-bold text-2xl">
          ชำระเงินเรียบร้อย<br/>
          <span class="block mt-3 text-lg">การขายสินค้าสำเร็จ</span>
          <button class="mt-6 w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow font-bold text-lg transition" @click="printReceipt" :disabled="printLoading">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 9v12h12V9M6 9V6a2 2 0 012-2h8a2 2 0 012 2v3" />
            </svg>
            <span v-if="printLoading">
              <span class="loader mr-2"></span> กำลังพิมพ์ใบเสร็จ...
            </span>
            <span v-else-if="printSuccess">
              ปริ้นใบเสร็จสำเร็จ
            </span>
            <span v-else>
              พิมพ์ใบเสร็จอีกครั้ง
            </span>
          </button>
          <button class="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full shadow p-4 z-40 flex items-center gap-2 text-lg font-bold" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden md:inline">ขายสินค้าต่อ</span>
          </button>
        </div>
        <div class="bg-white rounded-xl shadow p-6 mb-6" v-if="orderItems.length && !paid">
          <h3 class="text-xl font-bold mb-3">รายละเอียดรายการสินค้า</h3>
          <div class="grid grid-cols-4 gap-3 font-bold text-base text-gray-700 mb-1">
            <div>ชื่อ</div>
            <div class="text-center">จำนวน</div>
            <div class="text-right">ราคา/หน่วย</div>
            <div class="text-right">รวม</div>
          </div>
          <div v-for="item in orderItems" :key="item.id" class="grid grid-cols-4 gap-3 items-center text-base mb-1">
            <div class="truncate">{{ item.name }}</div>
            <div class="text-center">x{{ item.qty }}</div>
            <div class="text-right">฿{{ item.price }}</div>
            <div class="text-right">฿{{ item.price * item.qty }}</div>
          </div>
        </div>
        <!-- Receipt modal removed, auto-print only -->
      </div>
    </main>
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
import { ref, computed } from 'vue';

// --- State ---
const paid = ref(false);
const loadingCash = ref(false);
const loadingPromptPay = ref(false);
const printLoading = ref(false);
const printSuccess = ref(false);
const cashInput = ref('');
const showCash = ref(true); // Default to cash tab
const showPromptPay = ref(false);
const cashQuickButtons = computed(() => {
  const amt = Number(totalAmount.value) || 0;
  if (!amt) return [];
  const buttons = [amt];
  // Next multiples: 5, 10, 50, 100, 500, 1000 (but only if greater than amt)
  const multiples = [5, 10, 50, 100, 500, 1000];
  multiples.forEach(m => {
    let next = Math.ceil(amt / m) * m;
    if (next <= amt) next += m;
    if (!buttons.includes(next)) buttons.push(next);
  });
  return [...new Set(buttons)].sort((a, b) => a - b);
});

function addCash(amount) {
  // Set cashInput to this amount (simulate customer hands this bill)
  cashInput.value = amount.toString();
}
const orderItems = ref([]);

// --- Demo: Load order from localStorage or mock ---
if (typeof window !== 'undefined') {
  const orderRaw = localStorage.getItem('order');
  if (orderRaw) {
    try {
      orderItems.value = JSON.parse(orderRaw);
    } catch {}
  }
}

const totalAmount = computed(() => orderItems.value.reduce((sum, item) => sum + (item.price * item.qty), 0));

// --- Tab switching ---
function payCash() {
  showCash.value = true;
  showPromptPay.value = false;
}
function payPromptPay() {
  showPromptPay.value = true;
  showCash.value = false;
}


function goBack() {
  // Go back to POS or previous page
  if (typeof window !== 'undefined') {
    window.history.back();
  }
}
function saveOrderToProfits(payType) {
  // Save a single grouped order for this payment
  const now = new Date();
  const bangkok = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const yyyy = bangkok.getFullYear();
  const mm = String(bangkok.getMonth() + 1).padStart(2, '0');
  const dd = String(bangkok.getDate()).padStart(2, '0');
  const hh = String(bangkok.getHours()).padStart(2, '0');
  const min = String(bangkok.getMinutes()).padStart(2, '0');
  const datetime = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  let profits = [];
  const profitsRaw = localStorage.getItem('profits');
  if (profitsRaw) profits = JSON.parse(profitsRaw);
  let maxId = profits.length ? Math.max(...profits.map(i => i.id || 0)) : 0;
  const total = orderItems.value.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const profitVal = orderItems.value.reduce((sum, item) => sum + ((item.price - (item.cost || 0)) * item.qty), 0);
  const orderCode = `ORD-${yyyy}${mm}${dd}-${String(maxId+1).padStart(4, '0')}`;
  profits.push({
    id: ++maxId,
    name: orderCode,
    items: orderItems.value.map(i => ({ name: i.name, qty: i.qty, price: i.price, cost: i.cost })),
    total,
    profit: profitVal,
    payType,
    status: 'active',
    datetime
  });
  localStorage.setItem('profits', JSON.stringify(profits));
  localStorage.removeItem('order_paid');
}

function confirmCash() {
  if (paid.value || loadingCash.value) return;
  loadingCash.value = true;
  setTimeout(() => {
    paid.value = true;
    loadingCash.value = false;
    if (orderItems.value.length) {
      saveOrderToProfits('เงินสด');
    }
    // Show change only after payment, and only once
    cashInput.value = '';
    orderItems.value = [];
    localStorage.removeItem('order');
    localStorage.removeItem('cart');
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new Event('profit-updated'));
        localStorage.setItem('profit-flush', Date.now().toString());
      }, 0);
    }
  }, 3000);
}

function confirmPromptPay() {
  if (paid.value || loadingPromptPay.value) return;
  loadingPromptPay.value = true;
  setTimeout(() => {
    paid.value = true;
    loadingPromptPay.value = false;
    if (orderItems.value.length) {
      saveOrderToProfits('พร้อมเพย์');
    }
    orderItems.value = [];
    localStorage.removeItem('order');
    localStorage.removeItem('cart');
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new Event('profit-updated'));
        localStorage.setItem('profit-flush', Date.now().toString());
      }, 0);
    }
  }, 3000);
}

function printReceipt() {
  if (printLoading.value || printSuccess.value) return;
  printLoading.value = true;
  setTimeout(() => {
    // ไม่ต้อง window.print();
    printLoading.value = false;
    printSuccess.value = true;
    setTimeout(() => {
      printSuccess.value = false;
    }, 5000);
  }, 2000);
}
</script>
