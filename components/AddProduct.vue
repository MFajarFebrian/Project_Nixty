<template>
  <div class="add-product">
    <h2>Add New Product</h2>
    <form @submit.prevent="handleAddProduct">
      <label for="productName">Product Name:</label>
      <input type="text" id="productName" v-model="productName" required/>
      
      <label for="productDescription">Description:</label>
      <textarea id="productDescription" v-model="productDescription"></textarea>
      
      <label for="productPrice">Price:</label>
      <input type="number" id="productPrice" v-model="productPrice" required/>

      <button type="submit">Add Product</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      productName: '',
      productDescription: '',
      productPrice: 0,
    };
  },
  methods: {
    handleAddProduct() {
      // Add product logic here
      console.log('Product added:', this.productName, this.productDescription, this.productPrice);
    },
  },
};
</script>

<style scoped>
.add-product {
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

input, textarea {
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
