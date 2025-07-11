// Utility untuk cache profile picture
export const profilePictureCache = {
  // Key untuk localStorage
  CACHE_KEY_PREFIX: 'nixty_profile_pic_',
  CACHE_EXPIRY_DAYS: 7, // Cache expire dalam 7 hari

  // Simpan profile picture ke cache
  save(userId, pictureUrl) {
    if (!userId || !pictureUrl) return;
    
    const cacheData = {
      url: pictureUrl,
      timestamp: Date.now(),
      expiresAt: Date.now() + (this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    };
    
    try {
      localStorage.setItem(`${this.CACHE_KEY_PREFIX}${userId}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache profile picture:', error);
    }
  },

  // Ambil profile picture dari cache
  get(userId) {
    if (!userId) return null;
    
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY_PREFIX}${userId}`);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheData.expiresAt) {
        this.remove(userId);
        return null;
      }
      
      return cacheData.url;
    } catch (error) {
      console.error('Failed to get cached profile picture:', error);
      return null;
    }
  },

  // Hapus cache untuk user tertentu
  remove(userId) {
    if (!userId) return;
    
    try {
      localStorage.removeItem(`${this.CACHE_KEY_PREFIX}${userId}`);
    } catch (error) {
      console.error('Failed to remove cached profile picture:', error);
    }
  },

  // Hapus semua cache yang expired
  cleanExpired() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheData = JSON.parse(cached);
            if (now > cacheData.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to clean expired cache:', error);
    }
  }
};

// Fungsi helper untuk mendapatkan URL profile picture dengan fallback
export function getProfilePictureUrl(user) {
  if (!user) return null;
  
  // Jika ada profile picture dari server
  if (user.profile_picture) {
    // Simpan ke cache untuk backup
    profilePictureCache.save(user.id, user.profile_picture);
    return user.profile_picture;
  }
  
  // Coba ambil dari cache
  const cachedUrl = profilePictureCache.get(user.id);
  if (cachedUrl) {
    return cachedUrl;
  }
  
  // Tidak ada profile picture
  return null;
}

// Clean expired cache setiap kali module di-load
if (typeof window !== 'undefined') {
  profilePictureCache.cleanExpired();
}
