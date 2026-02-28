<template>
  <header class="fixed top-0 left-0 w-full z-30 bg-white shadow flex items-center justify-between px-4 md:px-8 py-2 font-prompt">
    <div class="flex items-center gap-3 cursor-pointer select-none" @click="goHome">
      <img
        src="/conStore-logo.jpg"
        alt="conStore Logo"
        class="w-12 h-12 rounded-full border-2 border-green-400 shadow-sm bg-white"
      />
      <span class="text-xl md:text-2xl font-bold text-green-700 tracking-wide">
        ระบบร้านขายของขนาดเล็ก (conStore)
      </span>
    </div>
    <div class="flex items-center gap-4">
      <span class="hidden md:inline text-gray-600 font-medium text-sm select-none">
        {{ now }}
      </span>
      <button
        @click="logout"
        class="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-red-500 hover:to-red-700 transition"
      >
        ออกจากระบบ
      </button>
    </div>
  </header>
</template>

<script setup>
function goHome() {
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    router.push('/admin-manager');
  } else if (role === 'staff') {
    router.push('/staff-manager');
  } else {
    router.push('/');
  }
}
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useCookie } from '#app'

const router = useRouter()
const userCookie = useCookie('user')
const roleCookie = useCookie('role')
function logout() {
  userCookie.value = null
  roleCookie.value = null
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  router.push('/login')
}

const now = ref('')
let timer = null
function updateNow() {
  const d = new Date()
  now.value = d.toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
}
onMounted(() => {
  updateNow()
  timer = setInterval(updateNow, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
:global(body) {
  padding-top: 60px;
}
@media (min-width: 768px) {
  :global(body) {
    padding-top: 64px;
  }
}
</style>