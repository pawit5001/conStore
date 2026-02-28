<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 font-prompt px-4">
    <div class="w-full max-w-md md:max-w-lg p-8 md:p-12 bg-white rounded-2xl shadow-2xl flex flex-col items-center">
      <img src="/conStore-logo.jpg" alt="conStore logo" class="w-20 h-20 rounded-full border-2 border-blue-300 shadow mb-6" />
      <h2 class="text-3xl md:text-4xl font-extrabold mb-8 text-center text-blue-700 tracking-tight">เข้าสู่ระบบ</h2>
      <form @submit.prevent="login" class="w-full space-y-6 relative">
        <div>
          <label class="block text-gray-700 mb-2 text-sm md:text-base font-medium">ชื่อผู้ใช้</label>
          <input v-model="username" type="text" class="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg transition" required placeholder="กรอกชื่อผู้ใช้">
        </div>
        <div>
          <label class="block text-gray-700 mb-2 text-sm md:text-base font-medium">รหัสผ่าน</label>
          <input v-model="password" type="password" class="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg transition" required placeholder="กรอกรหัสผ่าน">
        </div>
        <button type="submit" class="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-blue-800 shadow-md transition" :disabled="loading">
          <span v-if="!loading">เข้าสู่ระบบ</span>
          <span v-else class="flex items-center justify-center">
            <span class="loader mr-2"></span> กำลังเข้าสู่ระบบ...
          </span>
        </button>
        <p v-if="error" class="mt-4 text-red-500 text-center text-base">{{ error }}</p>
      </form>
      <div class="mt-8 text-center text-xs text-gray-400">© 2026 conStore. All Rights Reserved.</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from '#app'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

function login() {
  let role = ''
  if (username.value === 'admin' && password.value === 'admin') {
    role = 'admin'
  } else if (username.value === 'staff' && password.value === 'admin') {
    role = 'staff'
  }
  if (role) {
    loading.value = true
    localStorage.setItem('user', username.value)
    localStorage.setItem('role', role)
    setTimeout(() => {
      loading.value = false
      if (role === 'admin') {
        router.push('/admin-manager')
      } else if (role === 'staff') {
        router.push('/staff-manager')
      }
    }, 3000)
  } else {
    error.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    setTimeout(() => {
      error.value = ''
    }, 5000)
  }
}
</script>

<style scoped>
.loader {
  border: 4px solid #e0e7ef;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Remove default margin/padding from html and body to prevent white space */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
