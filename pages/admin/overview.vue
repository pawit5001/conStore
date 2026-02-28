<script setup>
// Role check: prevent staff from accessing admin page
if (process.client) {
  const role = localStorage.getItem('role');
  if (role === 'staff') {
    window.location.href = '/staff-manager';
  }
}
import { Bar, Pie } from 'vue-chartjs';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);
import { onMounted, onUnmounted, watch, ref } from 'vue';
// Period selection for sales chart
const periodOptions = [
  { label: '7 วัน', value: 'week' },
  { label: 'เดือน', value: 'month' },
  { label: 'ปี', value: 'year' }
];
const selectedPeriod = ref('week');
import { useRouter } from '#app';

const router = useRouter();
function goHome() {
  router.push('/admin-manager');
}
const bestSellersQty = ref({});
const worstSellersQty = ref({});

const PROFIT_KEY = 'profits';
// Use Asia/Bangkok timezone for today
function getBangkokTodayStr() {
  const now = new Date();
  // Get Bangkok time parts safely
  const bangkok = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const yyyy = bangkok.getFullYear();
  const mm = String(bangkok.getMonth() + 1).padStart(2, '0');
  const dd = String(bangkok.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
const selectedDate = ref(getBangkokTodayStr());
// Remove profits ref, always use loadProfits()
const overviewKey = ref(Date.now());
const sales = ref(0);
const profit = ref(0);
const growthData = ref([]);
const growthLabels = ref([]);
const pieData = ref({ labels: [], datasets: [] });
const bestSellers = ref([]);
const worstSellers = ref([]);
const percentGrowth = ref(0);
const prevSales = ref(0);

const sampleProfits = [
  {
    id: 1,
    name: 'ORD-20260225-0001',
    items: [
      { name: 'ข้าวสาร', qty: 2, price: 35, cost: 15 },
      { name: 'โค้ก', qty: 1, price: 15, cost: 8 }
    ],
    total: 85,
    profit: 47,
    payType: 'เงินสด',
    status: 'active',
    datetime: '2026-02-25T09:00'
  },
  {
    id: 2,
    name: 'ORD-20260225-0002',
    items: [
      { name: 'โค้ก', qty: 3, price: 15, cost: 8 },
      { name: 'น้ำเปล่า', qty: 2, price: 10, cost: 4 }
    ],
    total: 65,
    profit: 29,
    payType: 'พร้อมเพย์',
    status: 'inactive',
    datetime: '2026-02-25T10:30'
  },
  {
    id: 3,
    name: 'ORD-20260226-0003',
    items: [
      { name: 'ข้าวสาร', qty: 1, price: 35, cost: 15 },
      { name: 'สบู่', qty: 1, price: 20, cost: 10 }
    ],
    total: 55,
    profit: 30,
    payType: 'เงินสด',
    status: 'active',
    datetime: getBangkokTodayStr() + 'T11:00'
  },
  {
    id: 4,
    name: 'ORD-20260226-0004',
    items: [
      { name: 'โค้ก', qty: 2, price: 15, cost: 8 },
      { name: 'น้ำปลา', qty: 1, price: 12, cost: 6 }
    ],
    total: 42,
    profit: 21,
    payType: 'พร้อมเพย์',
    status: 'active',
    datetime: getBangkokTodayStr() + 'T13:30'
  }
];

function loadProfits() {
  // Always reload from localStorage for latest data
  const data = localStorage.getItem(PROFIT_KEY);
  if (data) {
    try {
      const arr = JSON.parse(data);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    } catch (e) {}
  }
  return [...sampleProfits];
}

function calcOverview() {
  // Always use fresh profits from storage for every calculation
  const profitsArr = loadProfits();
  // Filter by selected date
  const today = selectedDate.value;
  const todayOrders = profitsArr.filter(p => p.datetime && p.datetime.slice(0, 10) === today);
  sales.value = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  profit.value = todayOrders.reduce((sum, o) => sum + (o.profit || 0), 0);
  // Previous day
  const prevDate = new Date(today);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevStr = prevDate.toISOString().slice(0, 10);
  const prevOrders = profitsArr.filter(p => p.datetime && p.datetime.slice(0, 10) === prevStr);
  prevSales.value = prevOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  percentGrowth.value = prevSales.value > 0 ? Math.round(((sales.value - prevSales.value) / prevSales.value) * 100) : (sales.value > 0 ? 100 : 0);
  // Growth chart by period
  const chart = [];
  const labels = [];
  if (selectedPeriod.value === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const daySales = profitsArr.filter(p => p.datetime && p.datetime.slice(0, 10) === dStr).reduce((sum, o) => sum + (o.total || 0), 0);
      chart.push(daySales);
      labels.push(dStr);
    }
  } else if (selectedPeriod.value === 'month') {
    // This month: show daily sales for each day in month
    const now = new Date(today);
    const year = now.getFullYear();
    const month = now.getMonth();
    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const daySales = profitsArr.filter(p => p.datetime && p.datetime.slice(0, 10) === dayStr).reduce((sum, o) => sum + (o.total || 0), 0);
      chart.push(daySales);
      labels.push(dayStr);
    }
  } else if (selectedPeriod.value === 'year') {
    // This year: show monthly sales for each month in year
    const now = new Date(today);
    const year = now.getFullYear();
    for (let m = 0; m < 12; m++) {
      const ym = `${year}-${String(m + 1).padStart(2, '0')}`;
      const monthSales = profitsArr.filter(p => p.datetime && p.datetime.slice(0, 7) === ym).reduce((sum, o) => sum + (o.total || 0), 0);
      chart.push(monthSales);
      labels.push(ym);
    }
  }
  growthData.value = chart;
  growthLabels.value = labels;

  // Pie chart: quantity sold per product (period)
  const prodMapPie = {};
  let periodOrders = todayOrders;
  if (selectedPeriod.value === 'week') {
    // 7 days
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    periodOrders = profitsArr.filter(p => p.datetime && days.includes(p.datetime.slice(0, 10)));
  } else if (selectedPeriod.value === 'month') {
    // This month
    const ym = today.slice(0, 7);
    periodOrders = profitsArr.filter(p => p.datetime && p.datetime.slice(0, 7) === ym);
  } else if (selectedPeriod.value === 'year') {
    // This year
    const y = today.slice(0, 4);
    periodOrders = profitsArr.filter(p => p.datetime && p.datetime.slice(0, 4) === y);
  }
  periodOrders.forEach(order => {
    (order.items || []).forEach(prod => {
      if (!prodMapPie[prod.name]) prodMapPie[prod.name] = 0;
      prodMapPie[prod.name] += prod.qty || 0;
    });
  });
  pieData.value = {
    labels: Object.keys(prodMapPie),
    datasets: [
      {
        data: Object.values(prodMapPie),
        backgroundColor: [
          '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#f87171', '#facc15', '#4ade80', '#38bdf8', '#f472b6'
        ],
      },
    ],
  };
  // Best/worst sellers (today)
  const prodMap = {};
  todayOrders.forEach(order => {
    (order.items || []).forEach(prod => {
      if (!prodMap[prod.name]) prodMap[prod.name] = 0;
      prodMap[prod.name] += prod.qty || 0;
    });
  });
  const sorted = Object.entries(prodMap).sort((a, b) => b[1] - a[1]);
  // Remove overlap: bestSellers and worstSellers must be mutually exclusive
  const best = sorted.slice(0, 3).map(([name]) => name);
  const worst = sorted.slice(-3).map(([name]) => name).filter(name => !best.includes(name));
  bestSellers.value = best;
  worstSellers.value = worst;
  bestSellersQty.value = Object.fromEntries(sorted.slice(0, 3));
  // For worst, only include those not in best
  worstSellersQty.value = Object.fromEntries(sorted.slice(-3).filter(([name]) => !best.includes(name)));
  // console.log('[OVERVIEW] sales:', sales.value, 'profit:', profit.value);
}


onMounted(() => {
  // Always reload profits on mount
  calcOverview();
  // Listen for custom event from profit page (after payment/save/delete)
  const profitListener = () => {
    // Always reload profits from localStorage
    calcOverview();
    overviewKey.value = Date.now();
  };
  window.addEventListener('profit-updated', profitListener);
  // Listen for localStorage changes (e.g. from profit page or other tabs)
  const storageListener = (e) => {
    if (e.key === PROFIT_KEY || e.key === 'profit-flush') {
      calcOverview();
      overviewKey.value = Date.now();
    }
  };
  window.addEventListener('storage', storageListener);
  // Clean up listeners on unmount
  onUnmounted(() => {
    window.removeEventListener('profit-updated', profitListener);
    window.removeEventListener('storage', storageListener);
  });
});

watch([selectedDate, selectedPeriod], () => {
  calcOverview();
}, { immediate: true });
</script>
<template>
  <div :key="overviewKey" class="min-h-screen bg-gradient-to-br from-orange-100 to-orange-300 flex flex-col font-prompt">
    <Header />
    <main class="flex-1 pt-16 sm:pt-20 max-w-full sm:max-w-5xl mx-auto w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-3 xs:p-4 sm:p-8 max-w-full sm:max-w-6xl w-full mx-auto px-1 xs:px-2 sm:px-12 mb-16">
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 class="text-xl xs:text-2xl font-bold text-orange-700 text-center sm:text-left">รายงานสรุปภาพรวม</h2>
          <input v-model="selectedDate" :key="'date-'+overviewKey" type="date" class="border rounded px-2 py-1 w-full sm:w-auto max-w-xs" />
        </div>
        <div class="mb-8">
          <h3 class="text-base xs:text-lg font-bold mb-2">ยอดขายและกำไร</h3>
          <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="bg-orange-200 rounded p-3 xs:p-4 flex-1 text-center min-w-[120px]">
              <div class="text-xl xs:text-2xl font-bold">฿{{ sales }}</div>
              <div class="text-xs xs:text-sm text-gray-600">ยอดขาย</div>
            </div>
            <div class="bg-green-200 rounded p-3 xs:p-4 flex-1 text-center min-w-[120px]">
              <div class="text-xl xs:text-2xl font-bold">฿{{ profit }}</div>
              <div class="text-xs xs:text-sm text-gray-600">กำไร</div>
            </div>
            <div class="bg-blue-100 rounded p-3 xs:p-4 flex-1 text-center min-w-[120px]">
              <div class="text-xl xs:text-2xl font-bold">{{ percentGrowth > 0 ? '+' : ''}}{{ percentGrowth }}%</div>
              <div class="text-xs xs:text-sm text-gray-600">เปลี่ยนแปลงจากเมื่อวาน<br><span class="text-[10px] xs:text-xs">(ยอดเมื่อวาน: ฿{{ prevSales }})</span></div>
            </div>
          </div>
        </div>
        <div class="mb-8">
          <div class="flex flex-col xs:flex-row xs:items-center xs:gap-4 mb-2">
            <h3 class="text-base xs:text-lg font-bold">กราฟยอดขาย</h3>
            <select v-model="selectedPeriod" class="border rounded px-2 py-1 text-sm ml-0 xs:ml-2 w-fit">
              <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="bg-white border rounded p-2 xs:p-4">
            <Bar
              :key="'bar-'+overviewKey+'-'+selectedPeriod"
              :data="{ labels: growthLabels, datasets: [{ label: 'ยอดขาย', data: growthData, backgroundColor: '#fb923c' }] }"
              :options="{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    ticks: {
                      callback: val => {
                        const d = growthLabels[val];
                        if (selectedPeriod === 'week') return new Date(d).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
                        if (selectedPeriod === 'month') {
                          const [y, m] = d.split('-');
                          return `${parseInt(m)}-${y.substr(2)}`;
                        }
                        if (selectedPeriod === 'year') return d;
                        return d;
                      }
                    }
                  }
                }
              }"
              style="max-height: 180px;"
            />
          </div>
                <div class="mb-8 mt-8">
                  <h3 class="text-base xs:text-lg font-bold mb-2">สัดส่วนยอดขายแต่ละสินค้า (Pie Chart)</h3>
                  <div class="bg-white border rounded p-2 xs:p-4 flex justify-center">
                    <Pie :key="'pie-'+overviewKey" :data="pieData" :options="{ responsive: true, plugins: { legend: { position: 'bottom' } } }" style="max-width: 400px; max-height: 300px;" />
                  </div>
                </div>
        </div>
        <div>
          <h3 class="text-base xs:text-lg font-bold mb-2">สินค้าขายดี / ขายไม่ดี ({{ new Date(selectedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) }})</h3>
          <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="flex-1 min-w-[120px]">
              <div class="font-bold text-green-700 mb-2">ขายดี</div>
              <ul>
                <li v-for="item in bestSellers" :key="item" class="text-green-600">
                  {{ item }} <span v-if="bestSellersQty[item]">({{ bestSellersQty[item] }} ชิ้น)</span>
                </li>
                <li v-if="bestSellers.length === 0" class="text-gray-400">-</li>
              </ul>
            </div>
            <div class="flex-1 min-w-[120px]">
              <div class="font-bold text-red-700 mb-2">ขายไม่ดี</div>
              <ul>
                <li v-for="item in worstSellers" :key="item" class="text-red-600">
                  {{ item }} <span v-if="worstSellersQty[item]">({{ worstSellersQty[item] }} ชิ้น)</span>
                </li>
                <li v-if="worstSellers.length === 0" class="text-gray-400">-</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
    </div>
    <!-- Floating Back Button -->
    <button class="fixed bottom-3 right-3 xs:bottom-4 xs:right-4 sm:bottom-6 sm:right-6 bg-orange-600 text-white rounded-full shadow-lg p-2 xs:p-3 sm:p-4 z-40 flex items-center gap-1 xs:gap-2 hover:bg-orange-700 transition-all border-2 border-white/80" @click="goHome">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span class="hidden md:inline">ย้อนกลับหน้าแรก</span>
    </button>
   </template>

