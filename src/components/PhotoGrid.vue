<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { getPhotos, searchPhotos, type UnsplashPhoto } from '../services/unsplash';

export default defineComponent({
  name: 'PhotoGrid',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['search-start', 'search-complete'],
  setup(props, { emit }) {
    const photos = ref<UnsplashPhoto[]>([]);
    const page = ref(1);
    const loading = ref(false);
    const initialLoading = ref(true);
    const error = ref<string | null>(null);
    const selectedPhoto = ref<UnsplashPhoto | null>(null);
    const isModalOpen = ref(false);
    const selectedPhotoIndex = ref(-1);

    // Create three columns for staggered grid
    const columns = computed(() => {
      const cols: UnsplashPhoto[][] = [[], [], []];
      // Filter out photos without location
      const photosWithLocation = photos.value.filter(photo => photo.user.location);
      photosWithLocation.forEach((photo, index) => {
        cols[index % 3].push(photo);
      });
      return cols;
    });

    const loadPhotos = async (isNewSearch = false) => {
      if (loading.value) return;
      
      try {
        loading.value = true;
        error.value = null;
        
        if (isNewSearch) {
          page.value = 1;
          photos.value = [];
          emit('search-start');
          window.scrollTo(0, 0); // Reset scroll position for new searches
        }

        const scrollPosition = window.scrollY; // Store current scroll position
        
        const newPhotos = props.searchQuery
          ? await searchPhotos(props.searchQuery, page.value)
          : await getPhotos(page.value);

        // Wait for the next DOM update before adding photos
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        photos.value = isNewSearch 
          ? newPhotos 
          : [...photos.value, ...newPhotos];
        
        page.value++;
        
        if (isNewSearch) {
          emit('search-complete');
        } else {
          // Restore scroll position after photos are added (only for infinite scroll)
          await new Promise(resolve => requestAnimationFrame(resolve));
          window.scrollTo(0, scrollPosition);
        }
      } catch (err) {
        error.value = 'Failed to load photos. Please try again later.';
        if (isNewSearch) {
          emit('search-complete');
        }
      } finally {
        loading.value = false;
        initialLoading.value = false;
      }
    };

    const handleScroll = () => {
      const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 1000;
      if (bottom && !loading.value) {
        loadPhotos();
      }
    };

    watch(() => props.searchQuery, () => {
      if (props.searchQuery) {
        loadPhotos(true);
      }
    });

    const openPhotoModal = (photo: UnsplashPhoto, index: number) => {
      selectedPhoto.value = photo;
      selectedPhotoIndex.value = index;
      isModalOpen.value = true;
      document.body.style.overflow = 'hidden';
    };

    const closePhotoModal = () => {
      isModalOpen.value = false;
      setTimeout(() => {
        selectedPhoto.value = null;
        selectedPhotoIndex.value = -1;
        document.body.style.overflow = '';
      }, 300);
    };

    const navigatePhotos = (direction: 'prev' | 'next') => {
      const allPhotos = photos.value.filter(photo => photo.user.location);
      const newIndex = direction === 'next' 
        ? (selectedPhotoIndex.value + 1) % allPhotos.length
        : (selectedPhotoIndex.value - 1 + allPhotos.length) % allPhotos.length;
      
      selectedPhotoIndex.value = newIndex;
      selectedPhoto.value = allPhotos[newIndex];
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (!isModalOpen.value) return;
      
      switch(event.key) {
        case 'ArrowLeft':
          navigatePhotos('prev');
          break;
        case 'ArrowRight':
          navigatePhotos('next');
          break;
        case 'Escape':
          closePhotoModal();
          break;
      }
    };

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.touches[0].clientX;
    };

    const handleTouchMove = (event: TouchEvent) => {
      touchEndX = event.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeThreshold = 50;
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > swipeThreshold) {
        navigatePhotos(swipeDistance > 0 ? 'prev' : 'next');
      }
    };

    onMounted(() => {
      loadPhotos();
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeydown);
    });

    return {
      columns,
      loading,
      initialLoading,
      error,
      selectedPhoto,
      isModalOpen,
      openPhotoModal,
      closePhotoModal,
      navigatePhotos,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
    };
  }
});
</script>

<template>
  <div class="photo-grid">
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div class="staggered-grid">
      <template v-if="initialLoading || loading">
        <div class="grid-column" v-for="i in 3" :key="'loading-'+i">
          <div v-for="j in 4" :key="'placeholder-'+j" class="photo-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-image"></div>
              <div class="placeholder-info">
                <div class="placeholder-text-group">
                  <div class="placeholder-text name"></div>
                  <div class="placeholder-text location"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="(column, colIndex) in columns" 
             :key="colIndex" 
             class="grid-column">
          <div v-for="(photo, photoIndex) in column" 
               :key="photo.id" 
               class="photo-item"
               @click="openPhotoModal(photo, photoIndex)">
            <div class="photo-wrapper">
              <img :src="photo.urls.regular" 
                   :alt="photo.alt_description || 'Unsplash photo'" 
                   loading="lazy" />
              <div class="photo-overlay"></div>
              <div class="photo-info">
                <div class="text-info">
                  <span class="name">{{ photo.user.name }}</span>
                  <span class="location" v-if="photo.user.location">
                    {{ photo.user.location }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Photo Modal with Transition -->
    <Transition name="modal">
      <div v-if="isModalOpen" 
           class="modal" 
           @click="closePhotoModal"
           @touchstart="handleTouchStart"
           @touchmove="handleTouchMove"
           @touchend="handleTouchEnd">
        <Transition name="modal-content">
          <div v-if="selectedPhoto" class="modal-content" @click.stop>
            <button class="close-button" @click="closePhotoModal">&times;</button>
            <button class="nav-button prev" @click.stop="navigatePhotos('prev')">&lt;</button>
            <button class="nav-button next" @click.stop="navigatePhotos('next')">&gt;</button>
            
            <div class="modal-image-container">
              <img :src="selectedPhoto.urls.regular" 
                   :alt="selectedPhoto.alt_description || 'Unsplash photo'"
                   class="modal-image" />
            </div>
            
            <div class="modal-info">
              <div class="photographer-info">
                <div>
                  <h3>{{ selectedPhoto.user.name }}</h3>
                  <p class="location" v-if="selectedPhoto.user.location">
                    {{ selectedPhoto.user.location }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.photo-grid {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 64px;
}

.staggered-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px;
  padding: 0 0 24px 0;
}

.grid-column {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.photo-item {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: #eee;
  break-inside: avoid;
  margin-bottom: 0;
}

.photo-wrapper {
  position: relative;
  width: 100%;
}

.photo-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.photo-item:hover .photo-wrapper img {
  transform: scale(1.02);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
  opacity: 1;
  transition: opacity 0.3s ease;
}

.photo-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  color: white;
  opacity: 1;
  transform: none;
}

.text-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.location {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* Loading placeholders */
.photo-placeholder {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.placeholder-content {
  position: relative;
  padding-bottom: 133.33%; /* 4:3 aspect ratio */
}

.placeholder-image {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f7f7f7 50%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.placeholder-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
}

.placeholder-text-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.placeholder-text {
  height: 14px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.placeholder-text::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

.placeholder-text.name {
  width: 70%;
  height: 16px;
}

.placeholder-text.location {
  width: 40%;
  height: 14px;
  opacity: 0.8;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.loading {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-background);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-error);
  background: rgba(255, 68, 68, 0.1);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: none;
}

.modal-content {
  position: relative;
  width: auto;
  max-width: 500px;
  height: auto;
  max-height: 95vh;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 20px;
}

.modal-image-container {
  position: relative;
  width: 100%;
  height: auto;
  max-height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: transparent;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.modal-info {
  position: relative;
  padding: 14px 20px;
  background: white;
  color: #111;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.photographer-info {
  margin-bottom: 0;
}

.photographer-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin: 0 0 4px 0;
}

.photographer-info .location {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.nav-button {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: none;
  color: #111;
  font-size: 18px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
}

.nav-button:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-button.prev {
  left: 32px;
}

.nav-button.next {
  right: 32px;
}

.close-button {
  position: fixed;
  top: 32px;
  right: 32px;
  background: white;
  border: none;
  color: #111;
  font-size: 18px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
}

.close-button:hover {
  opacity: 1;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .staggered-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
  }
  
  .grid-column {
    gap: 32px;
  }
  
  .photo-grid {
    padding: 0 48px;
  }
}

@media (max-width: 768px) {
  .staggered-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
  
  .grid-column {
    gap: 24px;
  }
  
  .photo-grid {
    padding: 0 24px;
  }
  
  .photo-info {
    opacity: 1;
    transform: translateY(0);
  }
  
  .photo-overlay {
    opacity: 1;
  }

  .modal-content {
    max-width: 85%;
    max-height: 98vh;
    margin: 0 10px;
    border-radius: 16px;
  }

  .modal-image-container {
    max-height: 88vh;
  }

  .modal-info {
    padding: 12px 16px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }

  .nav-button {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .nav-button.prev {
    left: 16px;
  }

  .nav-button.next {
    right: 16px;
  }

  .close-button {
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style> 