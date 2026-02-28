<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 px-2 md:px-6 flex flex-col font-prompt">
    <Header @logout="logout" />
    <main class="flex-1 pt-20 md:pt-24">
      <div v-if="$route.name === 'staff-manager'" class="max-w-5xl mx-auto mt-4 md:mt-8 p-4 md:p-8 bg-white rounded-2xl shadow-2xl transition-all duration-300">
        <h2 class="text-3xl md:text-4xl font-extrabold mb-10 text-green-700 text-center flex items-center justify-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 01.88 7.88M8 7a4 4 0 00-.88 7.88M12 3v1m0 16v1m8.66-13.66l-.7.7M4.34 19.66l-.7.7M21 12h-1M4 12H3m16.66 7.66l-.7-.7M4.34 4.34l-.7-.7" /></svg>
          ยินดีต้อนรับ, <span class="ml-2">พนักงาน</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
          <!-- ขายสินค้า -->
          <div class="bg-gradient-to-br from-blue-100 to-blue-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-blue-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <button class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-bold text-lg shadow transition w-full" @click="goTo('pos')">ขายสินค้า</button>
          </div>
          <!-- ตรวจสอบสินค้า -->
          <div class="bg-gradient-to-br from-green-100 to-green-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-green-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <button class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-bold text-lg shadow transition w-full" @click="goTo('product')">ตรวจสอบสินค้า</button>
          </div>
          <!-- ตรวจสอบยอดขาย -->
          <div class="bg-gradient-to-br from-pink-100 to-pink-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-pink-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
            </svg>
            <button class="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 font-bold text-lg shadow transition w-full" @click="goTo('sales-summary')">ตรวจสอบยอดขาย</button>
          </div>
          <!-- จัดทำรายงานสรุปยอดขาย -->
          <div class="bg-gradient-to-br from-orange-100 to-orange-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-orange-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            <button class="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-bold text-lg shadow transition w-full" @click="goTo('overview')">จัดทำรายงานสรุปยอดขาย</button>
          </div>
        </div>
      </div>
      <NuxtPage v-else :key="$route.fullPath" />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useRouter } from '#app'

const router = useRouter()

onMounted(() => {
  const userType = localStorage.getItem('user') || 'guest'
  if (userType !== 'staff') {
    router.push('/login')
  }
})

function logout() {
  localStorage.removeItem('user')
  router.push('/login')
}

function goTo(page) {
  router.push('/staff/' + page)
}
</script>
