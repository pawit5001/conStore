<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-200 flex flex-col font-prompt">
    <Header />
    <div class="flex flex-1">
      <!-- <Sidebar :show="true" :admin="true" @goHome="goHome" /> -->
      <main class="flex-1 pt-20 max-w-3xl w-full mx-auto px-2 sm:px-4 md:px-8">
        <div class="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mb-10">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-indigo-700">รายชื่อพนักงาน</h2>
            <button class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 font-bold" @click="addEmployee">เพิ่มพนักงาน</button>
          </div>
          <div class="flex gap-2 mb-4">
            <input v-model="search" type="text" placeholder="ค้นหาพนักงาน" class="border rounded px-2 py-1 flex-1" />
            <select v-model="sortType" class="border rounded px-2 py-1">
              <option value="name">ชื่อ (ก-ฮ)</option>
              <option value="role">ตำแหน่ง</option>
              <option value="status">สถานะ</option>
              <option value="active">เฉพาะเปิดใช้งาน</option>
              <option value="inactive">เฉพาะปิดใช้งาน</option>
              <option value="created-desc">วันที่เพิ่มล่าสุด</option>
              <option value="created-asc">วันที่เพิ่มเก่าสุด</option>
              <option value="updated-desc">วันที่แก้ไขล่าสุด</option>
              <option value="updated-asc">วันที่แก้ไขเก่าสุด</option>
            </select>
          </div>
          <ul>
            <li v-for="emp in pagedEmployees" :key="emp.id" class="flex justify-between items-center border-b py-2">
              <div>
                <div class="font-semibold">{{ emp.name }}</div>
                <div class="text-sm text-gray-500">{{ emp.role }} | {{ emp.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</div>
                <div class="text-xs text-gray-400">
                  เพิ่มเมื่อ: {{ emp.createdAt ? new Date(emp.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' }) : '-' }}<br>
                  แก้ไขล่าสุด: {{ emp.updatedAt ? new Date(emp.updatedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' }) : '-' }}
                </div>
              </div>
              <div class="flex gap-2">
                <button class="bg-yellow-400 text-white px-2 py-1 rounded" @click="editEmployee(emp.id)">แก้ไข</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded" @click="confirmDelete(emp.id)">ลบ</button>
              </div>
            </li>
          </ul>
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6 mb-8">
            <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold" :disabled="page === 1" @click="goPrev">ก่อนหน้า</button>
            <span v-for="p in totalPages" :key="p">
              <button class="px-3 py-1 rounded font-bold" :class="p === page ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'" @click="goToPage(p)">{{ p }}</button>
            </span>
            <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold" :disabled="page === totalPages" @click="goNext">ถัดไป</button>
          </div>
          <!-- Edit/Add Modal -->
          <div v-if="showEdit" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
              <button class="absolute top-2 right-2 text-gray-500 hover:text-red-500" @click="cancelEdit">✕</button>
              <h3 class="text-xl font-bold mb-4 text-center">{{ editId === null ? 'เพิ่มพนักงาน' : 'แก้ไขพนักงาน' }}</h3>
              <div class="mb-3">
                <label class="block mb-1 font-bold">ชื่อพนักงาน</label>
                <input v-model="editName" type="text" class="border rounded px-2 py-1 w-full" placeholder="สมชาย ใจดี" />
              </div>
              <div class="mb-3">
                <label class="block mb-1 font-bold">ตำแหน่ง</label>
                <select v-model="editRole" class="border rounded px-2 py-1 w-full">
                  <option value="พนักงาน">พนักงาน</option>
                  <option value="เจ้าของร้าน">เจ้าของร้าน</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="block mb-1 font-bold">สถานะ</label>
                <select v-model="editStatus" class="border rounded px-2 py-1 w-full">
                  <option value="active">เปิดใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
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
              <h3 class="text-xl font-bold mb-4 text-center">ยืนยันการลบพนักงาน</h3>
              <p class="mb-4 text-center text-gray-700">คุณต้องการลบพนักงานคนนี้ออกจากระบบหรือไม่?</p>
              <div class="flex gap-2 mt-4 justify-center">
                <button class="bg-red-500 text-white px-4 py-2 rounded font-bold flex-1" @click="doDelete">ลบ</button>
                <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold flex-1" @click="cancelDelete">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
        <button class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-indigo-600 text-white rounded-full shadow-lg p-3 sm:p-4 z-40 flex items-center gap-2 hover:bg-indigo-700 transition-all border-2 border-white/80" @click="goHome">
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
// Role check: prevent staff from accessing admin page
if (process.client) {
  const role = localStorage.getItem('role');
  if (role === 'staff') {
    window.location.href = '/staff-manager';
  }
}
import { ref, computed } from 'vue'
import Header from '@/components/Header.vue'
import { useRouter } from '#app'
const router = useRouter()
import Sidebar from '@/components/Sidebar.vue'

const EMPLOYEE_KEY = 'employees'
const defaultEmployees = [
  { id: 1, name: 'สมชาย ใจดี', role: 'พนักงาน', status: 'active', createdAt: '2026-02-01T09:00', updatedAt: '2026-02-01T09:00' },
  { id: 2, name: 'สมหญิง ขยัน', role: 'พนักงาน', status: 'inactive', createdAt: '2026-02-01T09:10', updatedAt: '2026-02-01T09:10' }
]
function loadEmployees() {
  const data = localStorage.getItem(EMPLOYEE_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return [...defaultEmployees]
    }
  }
  return [...defaultEmployees]
}
function saveEmployees(list) {
  localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(list))
}

const employees = ref(loadEmployees())
const search = ref('')
const filterStatus = ref('')
const sortType = ref('name')

const filteredEmployees = computed(() => {
  let list = employees.value.filter(emp => {
    const matchesSearch = emp.name.includes(search.value)
    // filter by status if selected
    if (sortType.value === 'active') return matchesSearch && emp.status === 'active'
    if (sortType.value === 'inactive') return matchesSearch && emp.status === 'inactive'
    return matchesSearch
  })
  // Sorting
  if (sortType.value === 'name') {
    list = list.slice().sort((a, b) => a.name.localeCompare(b.name, 'th'))
  } else if (sortType.value === 'role') {
    list = list.slice().sort((a, b) => a.role.localeCompare(b.role, 'th'))
  } else if (sortType.value === 'status') {
    list = list.slice().sort((a, b) => a.status.localeCompare(b.status, 'th'))
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
const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / pageSize.value))
const pagedEmployees = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredEmployees.value.slice(start, start + pageSize.value)
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
watch([filteredEmployees, pageSize], () => {
  page.value = 1
})

const showEdit = ref(false)
const editId = ref(null)
const editName = ref('')
const editRole = ref('พนักงาน')
const editStatus = ref('active')

const showDeleteModal = ref(false)
const deleteId = ref(null)

function addEmployee() {
  showEdit.value = true
  editId.value = null
  editName.value = ''
  editRole.value = 'พนักงาน'
  editStatus.value = 'active'
}
function editEmployee(id) {
  const emp = employees.value.find(e => e.id === id)
  if (emp) {
    showEdit.value = true
    editId.value = id
    editName.value = emp.name
    editRole.value = emp.role
    editStatus.value = emp.status
  }
}
function deleteEmployee(id) {
  employees.value = employees.value.filter(emp => emp.id !== id)
  saveEmployees(employees.value)
}
function confirmDelete(id) {
  showDeleteModal.value = true
  deleteId.value = id
}
function doDelete() {
  if (deleteId.value !== null) {
    employees.value = employees.value.filter(emp => emp.id !== deleteId.value)
    saveEmployees(employees.value)
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
    alert('กรุณากรอกชื่อพนักงาน')
    return
  }
  const now = new Date().toISOString()
  if (editId.value === null) {
    // Add
    const newId = employees.value.length ? Math.max(...employees.value.map(e => e.id)) + 1 : 1
    employees.value.push({
      id: newId,
      name: editName.value,
      role: editRole.value,
      status: editStatus.value,
      createdAt: now,
      updatedAt: now
    })
  } else {
    // Edit
    const idx = employees.value.findIndex(e => e.id === editId.value)
    if (idx !== -1) {
      const emp = employees.value[idx]
      // เช็คว่ามีการเปลี่ยนแปลงจริงหรือไม่
      const changed = emp.name !== editName.value || emp.role !== editRole.value || emp.status !== editStatus.value
      employees.value[idx] = {
        ...emp,
        name: editName.value,
        role: editRole.value,
        status: editStatus.value,
        updatedAt: changed ? now : emp.updatedAt
      }
    }
  }
  saveEmployees(employees.value)
  showEdit.value = false
}
function cancelEdit() {
  showEdit.value = false
}
function goHome() {
  router.push('/admin-manager')
}
</script>
