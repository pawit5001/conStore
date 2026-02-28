<template>
  <div v-if="show" class="fixed inset-0 z-40 flex">
    <div class="w-64 bg-white shadow-lg h-full flex flex-col">
      <div class="flex items-center justify-between p-4 border-b">
        <button @click="$emit('close')" class="md:hidden mr-2 bg-white rounded-full shadow p-2 flex items-center justify-center w-10 h-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7 text-gray-700">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="font-bold text-lg">หมวดหมู่สินค้า</span>
        <button @click="$emit('close')" class="text-gray-500 hover:text-red-500">ปิด</button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <ul>
          <li v-for="cat in categories" :key="cat.id" class="p-3 hover:bg-blue-100 cursor-pointer" @click="$emit('selectCategory', cat.id)">
            {{ cat.name }}
          </li>
        </ul>
      </div>
      <div class="p-4 border-t">
        <button @click="goHome" class="bg-gray-300 w-full py-2 rounded hover:bg-gray-400">กลับหน้าแรก</button>
      </div>
    </div>
    <div class="flex-1 bg-black bg-opacity-30" @click="$emit('close')"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  categories: Array
})
import { useRouter } from '#app'
const router = useRouter()

function goHome() {
  router.push('/admin-manager')
}
</script>
