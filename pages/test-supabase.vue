<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Supabase Test Page</h1>
    
    <div class="mb-4">
      <button 
        @click="testConnection" 
        :disabled="loading"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ loading ? 'Testing...' : 'Test Connection' }}
      </button>
    </div>

    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>Error:</strong> {{ error }}
    </div>

    <div v-if="connectionStatus" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      <strong>Status:</strong> {{ connectionStatus }}
    </div>

    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">Todos:</h2>
      <div v-if="todos.length === 0" class="text-gray-500">
        No todos found. Make sure you have a 'todos' table in your Supabase database.
      </div>
      <ul v-else class="list-disc pl-5">
        <li v-for="todo in todos" :key="todo.id" class="mb-1">
          {{ todo.name || todo.title || JSON.stringify(todo) }}
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 bg-gray-100 rounded">
      <h3 class="font-semibold mb-2">Environment Variables:</h3>
      <p><strong>SUPABASE_URL:</strong> {{ supabaseUrl ? 'Set' : 'Not set' }}</p>
      <p><strong>SUPABASE_KEY:</strong> {{ supabaseKey ? 'Set' : 'Not set' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const todos = ref([])
const loading = ref(false)
const error = ref('')
const connectionStatus = ref('')

// Use the composable
const { supabase } = useSupabase()

// Check environment variables
const config = useRuntimeConfig()
const supabaseUrl = config.public.supabaseUrl
const supabaseKey = config.public.supabaseKey

async function testConnection() {
  loading.value = true
  error.value = ''
  connectionStatus.value = ''

  try {
    // Test basic connection
    const { data, error: connectionError } = await supabase
      .from('todos')
      .select('*')
      .limit(10)

    if (connectionError) {
      throw connectionError
    }

    todos.value = data || []
    connectionStatus.value = `Successfully connected! Found ${data?.length || 0} todos.`
  } catch (err) {
    error.value = err.message || 'Unknown error occurred'
    console.error('Supabase connection error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Auto-test connection on mount
  testConnection()
})
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
