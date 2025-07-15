<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Supabase Database Explorer</h1>
    
    <div class="mb-4">
      <button 
        @click="listTables" 
        :disabled="loading"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mr-2"
      >
        {{ loading ? 'Loading...' : 'List Tables' }}
      </button>
      
      <button 
        @click="testBasicConnection" 
        :disabled="loading"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ loading ? 'Testing...' : 'Test Connection' }}
      </button>
    </div>

    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>Error:</strong> {{ error }}
    </div>

    <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      <strong>Success:</strong> {{ successMessage }}
    </div>

    <div v-if="tables.length > 0" class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Available Tables:</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="table in tables" 
          :key="table.table_name"
          class="border rounded p-4 hover:bg-gray-50 cursor-pointer"
          @click="exploreTable(table.table_name)"
        >
          <h3 class="font-semibold">{{ table.table_name }}</h3>
          <p class="text-sm text-gray-600">Schema: {{ table.table_schema }}</p>
        </div>
      </div>
    </div>

    <div v-if="selectedTable" class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Data from "{{ selectedTable }}":</h2>
      <div class="mb-2">
        <button 
          @click="refreshTableData" 
          :disabled="loading"
          class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
      
      <div v-if="tableData.length === 0" class="text-gray-500">
        No data found in this table.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th 
                v-for="column in Object.keys(tableData[0])" 
                :key="column"
                class="border border-gray-300 px-4 py-2 text-left"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableData" :key="row.id || Math.random()">
              <td 
                v-for="column in Object.keys(row)" 
                :key="column"
                class="border border-gray-300 px-4 py-2"
              >
                {{ formatValue(row[column]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-6 p-4 bg-gray-100 rounded">
      <h3 class="font-semibold mb-2">Connection Status:</h3>
      <p><strong>SUPABASE_URL:</strong> {{ supabaseUrl ? 'Set' : 'Not set' }}</p>
      <p><strong>SUPABASE_KEY:</strong> {{ supabaseKey ? 'Set' : 'Not set' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const tables = ref([])
const selectedTable = ref('')
const tableData = ref([])

// Use the composable
const { supabase } = useSupabase()

// Check environment variables
const config = useRuntimeConfig()
const supabaseUrl = config.public.supabaseUrl
const supabaseKey = config.public.supabaseKey

async function listTables() {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    // Try to access known tables from your existing schema
    const tableNames = ['products', 'categories', 'announcements', 'hero_slides', 'product_licenses', 'users', 'transactions']
    const tableList = []
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(0) // Just check if table exists
        
        if (!error) {
          tableList.push({
            table_name: tableName,
            table_schema: 'public'
          })
        }
      } catch (e) {
        // Table doesn't exist, skip it
      }
    }

    tables.value = tableList
    successMessage.value = `Found ${tableList.length} tables in your database.`
  } catch (err) {
    error.value = err.message || 'Unknown error occurred'
    console.error('Error listing tables:', err)
  } finally {
    loading.value = false
  }
}

async function testBasicConnection() {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    // Test basic connection by trying to access products table
    const { data, error: testError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1)

    if (testError) {
      throw testError
    }

    successMessage.value = `Connection successful! Found ${data?.length || 0} products.`
  } catch (err) {
    error.value = err.message || 'Unknown error occurred'
    console.error('Error testing connection:', err)
  } finally {
    loading.value = false
  }
}

async function exploreTable(tableName) {
  selectedTable.value = tableName
  await refreshTableData()
}

async function refreshTableData() {
  if (!selectedTable.value) return

  loading.value = true
  error.value = ''

  try {
    const { data, error: dataError } = await supabase
      .from(selectedTable.value)
      .select('*')
      .limit(10)

    if (dataError) {
      throw dataError
    }

    tableData.value = data || []
  } catch (err) {
    error.value = err.message || 'Unknown error occurred'
    console.error('Error fetching table data:', err)
  } finally {
    loading.value = false
  }
}

function formatValue(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

onMounted(() => {
  // Auto-list tables on mount
  listTables()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
