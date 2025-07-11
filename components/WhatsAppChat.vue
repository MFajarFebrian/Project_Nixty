<template>
  <div class="whatsapp-container">
    <div v-if="isMenuOpen" class="whatsapp-menu">
      <div class="menu-header">Pilih topik pesan</div>
      <ul>
        <li v-for="message in predefinedMessages" :key="message.id">
          <a :href="generateLink(message.text)" target="_blank" rel="noopener noreferrer" @click="toggleMenu">
            {{ message.label }}
          </a>
        </li>
      </ul>
    </div>
    <button @click="toggleMenu" class="whatsapp-button" aria-label="Open WhatsApp chat menu">
      <svg v-if="!isMenuOpen" fill="white" class="whatsapp-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871-.118.571-.355 1.639-1.879 1.871-2.125.228-.247.228-.462.152-.587z"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="white" class="whatsapp-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'WhatsAppChat',
  props: {
    phoneNumber: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isMenuOpen: false,
      predefinedMessages: [
        { id: 1, label: 'Kendala', text: 'Halo, saya mengalami kendala.' },
        { id: 2, label: 'Panduan Website', text: 'Halo, saya butuh panduan untuk menggunakan website.' },
        { id: 3, label: 'Tanya Produk', text: 'Halo, saya ingin bertanya tentang produk.' }
      ]
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    generateLink(messageText) {
      const cleanPhoneNumber = this.phoneNumber.replace(/[\s+()-]/g, '');
      const encodedText = encodeURIComponent(messageText);
      return `https://wa.me/${cleanPhoneNumber}?text=${encodedText}`;
    }
  }
};
</script>

<style scoped>
.whatsapp-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.whatsapp-menu {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 15px;
  width: 250px;
  overflow: hidden;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-header {
  padding: 12px 16px;
  font-weight: bold;
  color: #333;
  background-color: #f7f7f7;
  border-bottom: 1px solid #eee;
}

.whatsapp-menu ul {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.whatsapp-menu li a {
  display: block;
  padding: 12px 16px;
  color: #555;
  text-decoration: none;
  transition: background-color 0.2s;
}

.whatsapp-menu li a:hover {
  background-color: #f2f2f2;
}

.whatsapp-button {
  cursor: pointer;
  border: none;
  background-color: #25D366;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease-in-out, background-color 0.2s;
}

.whatsapp-button:hover {
  transform: scale(1.1);
  background-color: #128C7E;
}

.whatsapp-icon {
  width: 32px;
  height: 32px;
}
</style> 