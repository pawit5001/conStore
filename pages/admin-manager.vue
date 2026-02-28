<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 px-2 md:px-6 flex flex-col font-prompt">
    <Header @logout="logout" />
    <main class="flex-1 pt-20 md:pt-24">
      <div v-if="$route.name === 'admin-manager'" class="max-w-5xl mx-auto mt-4 md:mt-8 p-4 md:p-8 bg-white rounded-2xl shadow-2xl transition-all duration-300">
        <h2 class="text-3xl md:text-4xl font-extrabold mb-10 text-green-700 text-center flex items-center justify-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 01.88 7.88M8 7a4 4 0 00-.88 7.88M12 3v1m0 16v1m8.66-13.66l-.7.7M4.34 19.66l-.7.7M21 12h-1M4 12H3m16.66 7.66l-.7-.7M4.34 4.34l-.7-.7" /></svg>
          ยินดีต้อนรับ, <span class="ml-2">เจ้าของร้าน</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <!-- ขายสินค้า -->
          <div class="bg-gradient-to-br from-blue-100 to-blue-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-blue-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <button class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-bold text-lg shadow transition w-full" @click="goTo('pos')">ขายสินค้า</button>
          </div>
          <!-- จัดการพนักงาน -->
          <div class="bg-gradient-to-br from-indigo-100 to-indigo-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-indigo-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            <button class="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 font-bold text-lg shadow transition w-full" @click="goTo('employee')">จัดการพนักงาน</button>
          </div>
          <!-- จัดการสินค้า -->
          <div class="bg-gradient-to-br from-green-100 to-green-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-green-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <button class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-bold text-lg shadow transition w-full" @click="goTo('product')">จัดการสินค้า</button>
          </div>
          <!-- จัดการหมวดหมู่ -->
          <div class="bg-gradient-to-br from-yellow-100 to-yellow-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-yellow-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            <button class="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 font-bold text-lg shadow transition w-full" @click="goTo('category')">จัดการหมวดหมู่</button>
          </div>
          <!-- จัดการยอดขายและกำไร -->
          <div class="bg-gradient-to-br from-pink-100 to-pink-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-pink-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
            </svg>
            <button class="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 font-bold text-lg shadow transition w-full" @click="goTo('profit')">จัดการยอดขายและกำไร</button>
          </div>
          <!-- รายงานสรุปภาพรวม -->
          <div class="bg-gradient-to-br from-orange-100 to-orange-300 p-6 rounded-xl shadow flex flex-col items-center hover:scale-105 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-orange-500 mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            <button class="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-bold text-lg shadow transition w-full" @click="goTo('overview')">รายงานสรุปภาพรวม</button>
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
  if (userType !== 'admin') {
    router.push('/login')
  }
})

function logout() {
  localStorage.removeItem('user')
  router.push('/login')
}

function goTo(page) {
  router.push('/admin/' + page)
}
</script>
