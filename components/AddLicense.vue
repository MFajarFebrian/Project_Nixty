<template>
  <div class="add-license">
    <h2>Add New License</h2>
    <form @submit.prevent="handleAddLicense">
      <label for="licenseName">License Name:</label>
      <input type="text" id="licenseName" v-model="licenseName" required/>
      
      <label for="licenseEmail">Email:</label>
      <input type="email" id="licenseEmail" v-model="licenseEmail" required/>

      <label for="licensePassword">Password:</label>
      <input type="password" id="licensePassword" v-model="licensePassword" required/>

      <button type="submit">Add License</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      licenseName: '',
      licenseEmail: '',
      licensePassword: '',
    };
  },
  methods: {
    handleAddLicense() {
      // Add license logic here
      console.log('License added:', this.licenseName, this.licenseEmail);
    },
  },
};
</script>

<style scoped>
.add-license {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  box-shadow: var(--galaxy-shadow-medium);
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  font-weight: bold;
  margin-bottom: 4px;
}

input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

button {
  padding: 10px;
  background-color: #4ECDC4;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #44A08D;
}
</style>
