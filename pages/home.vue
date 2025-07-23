<template>
  <div class="home-page">
    <div class="hero-announcements-container">
      <!-- Static Hero Section -->
      <div class="hero-carousel-container">
        <div class="hero-carousel">
          <div class="carousel-slide active">
            <div class="slide-background">
              <img src="~/assets/images/hero-background.jfif" alt="Welcome to Project Nixty" class="slide-bg-image" loading="lazy" decoding="async" @error="handleHeroImageError($event)" />
              <div class="slide-overlay"></div>
            </div>
            <div class="slide-content">
              <div class="slide-info">
                <h1 class="slide-title">Welcome to Project Nixty</h1>
                <p class="slide-description">Your trusted destination for high-quality digital products and software licenses. Get authentic, reliable, and affordable software solutions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Announcements Section (40% right) -->
      <div class="announcements-section">
        <div class="section-header">
          <h2 class="section-title">Latest Updates</h2>
        </div>

        <div class="announcements-list">
          <div class="announcement-card">
            <img src="~/assets/images/announcement.jfif" alt="Welcome to Project Nixty" class="announcement-image" loading="lazy" decoding="async" @error="handleImageError($event, '~/assets/images/announcement.jfif')" />
            <div class="announcement-content">
              <h3 class="announcement-title">Welcome to Project Nixty</h3>
              <p class="announcement-date">Your trusted software marketplace</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <InfoSection title="FAQ">
      <div class="faq-content">
        <div class="faq-block">
          <h3>About Us</h3>
          <p>Welcome to Project Nixty, your trusted destination for high-quality digital products and software licenses. We are committed to providing authentic, reliable, and affordable software solutions to individuals and businesses worldwide.</p>
          <p>Our mission is to make premium software accessible to everyone while ensuring security, authenticity, and excellent customer service.</p>
        </div>
        <div class="faq-block">
          <h3>How to Order</h3>
          <ol>
            <li>Browse our products and select the one you need.</li>
            <li>Select product and proceed to checkout.</li>
            <li>Complete the payment using our secure gateway.</li>
            <li>Receive your license instantly in your profile and via email.</li>
          </ol>
        </div>
        <div class="faq-block">
          <h3>How to Activate License</h3>
          <ol>
            <li>Download and install the software from the official website.</li>
            <li>Locate your license key in your "Orders".</li>
            <li>Open the software and find the activation/registration option.</li>
            <li>Enter your license key to complete the activation.</li>
            <li>Guide can be found at order detail and email too.</li>
          </ol>
          <p><em>If you need help, please contact our support team.</em></p>
        </div>
      </div>
    </InfoSection>
  </div>
</template>

<script setup>
import { useImageLoader } from '~/composables/useImageLoader';
import InfoSection from '~/components/InfoSection.vue';

// Apply user-only middleware to prevent admin access
definePageMeta({
  middleware: 'user-only'
});

const { getImageUrl, handleImageError, handleHeroImageError } = useImageLoader();

useHead({
  title: 'Home'
});
</script>

<style scoped>
@import '~/assets/css/pages/home.css';

.faq-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--galaxy-space-lg);
  color: var(--galaxy-starlight);
}

.faq-block {
  background: rgba(var(--galaxy-dark-matter-rgb, 26, 26, 46), 0.7);
  padding: var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(var(--galaxy-moonbeam-rgb, 255, 255, 255), 0.1);
}

.faq-block h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--galaxy-space-md);
  color: var(--galaxy-aurora-cyan);
}

.faq-block p, .faq-block li {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: var(--galaxy-space-sm);
}

.faq-block ol {
  padding-left: 1.25rem;
}
</style>


