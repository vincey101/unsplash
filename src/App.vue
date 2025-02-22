<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
const PhotoGrid = defineAsyncComponent(() => import('./components/PhotoGrid.vue'))
const searchQuery = ref('')
const isSearching = ref(false)

const handleSearch = (query: string) => {
  isSearching.value = true;
}

const onSearchComplete = () => {
  isSearching.value = false;
}
</script>

<template>
  <div class="app-container">
    <div class="search-section">
      <div class="search-container">
        <div class="search-box">
          <i class="search-icon">🔍</i>
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search for photo"
            class="search-input"
            @keyup.enter="$emit('search', searchQuery)"
          >
        </div>
        <div v-if="searchQuery" class="search-title">
          <span class="search-status">{{ isSearching ? 'Searching' : 'Search Results' }} for</span>
          <span class="search-query">"{{ searchQuery }}"</span>
        </div>
      </div>
    </div>

    <main>
      <PhotoGrid 
        :search-query="searchQuery" 
        @search-start="handleSearch"
        @search-complete="onSearchComplete"
      />
    </main>
  </div>
</template>

<style>
:root {
  --color-primary: #2196f3;
  --color-secondary: #333;
  --color-background: #ffffff;
  --color-text: #333333;
  --color-text-light: #666666;
  --color-error: #ff4444;
  --color-success: #4caf50;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
  
  --container-max-width: 1200px;
  --grid-column-width: 300px;
  --backdrop-height: 300px;
  --backdrop-color: #f5f7fa;
  --search-height: 56px;
  --overlay-color: rgba(0, 0, 0, 0.3);
  --search-section-height: 400px;
  --search-box-height: 56px;
  --search-background: #f3f5f8;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: var(--color-text);
  background-color: var(--color-background);
}

header {
  background: var(--color-secondary);
  color: var(--color-background);
  padding: var(--spacing-lg);
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 2em;
  font-weight: 600;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-section {
  height: 300px;
  background-color: #DCE3EB;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.search-container {
  width: 100%;
  max-width: 800px;
  padding-top: 80px;
}

.search-box {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.search-input {
  width: 100%;
  height: 54px;
  padding: 0 var(--spacing-xl) 0 54px;
  border: none;
  border-radius: 27px;
  font-size: 1.1em;
  background-color: var(--color-background);
  box-shadow: var(--shadow-md);
}

.search-icon {
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-light);
  font-style: normal;
  font-size: 20px;
}

.search-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  padding: 0;
}

.search-status {
  color: #29384B;
}

.search-query {
  color: #6C727D;
  margin-left: 8px;
}

main {
  flex: 1;
  margin-top: -80px;
  padding: 0 var(--spacing-lg);
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .search-section {
    height: 250px;
    padding: 0 var(--spacing-md);
  }

  .search-container {
    padding-top: 60px;
  }

  .search-title {
    font-size: 24px;
  }

  main {
    margin-top: -60px;
    padding: 0 var(--spacing-md);
  }
}
</style>
