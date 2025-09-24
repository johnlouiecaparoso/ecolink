<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'

const route = useRoute()

const showHeader = computed(() => {
  // Don't show header on auth pages
  return !['login', 'register'].includes(route.name)
})
</script>

<template>
  <div>
    <Header v-if="showHeader" />
    <router-view />
  </div>
</template>

<style>
:root {
  /* Core Colors */
  --primary-color: #069e2d;
  --primary-hover: #058e3f;
  --primary-dark: #04773b;
  --primary-light: #e8f5e8;

  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #717182;

  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fdf8;
  --bg-muted: #ececf0;
  --bg-accent: #e9ebef;

  /* Border Colors */
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-6xl: 3.75rem;

  /* Transitions */
  --transition: all 0.15s ease-in-out;
}

html,
body,
#app {
  height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-primary) 50%, #f0f8f0 100%);
}

.auth-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-hover) 50%,
    var(--primary-dark) 100%
  );
  color: white;
  position: relative;
  overflow: hidden;
}

.auth-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-card {
  max-width: 32rem;
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.brand-badge {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-lg);
}

/* Auth Logo Styles */
.auth-logo {
  position: relative;
  width: 2rem;
  height: 1.5rem;
}

.auth-logo-cloud {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(144, 238, 144, 0.8) 0%, rgba(34, 139, 34, 0.8) 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-logo-buildings {
  position: absolute;
  bottom: 0.15rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 0.1rem;
}

.auth-building {
  background: rgba(0, 100, 0, 0.8);
  border-radius: 0.08rem 0.08rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.08rem 0.04rem 0.04rem 0.04rem;
  gap: 0.04rem;
}

.auth-building-left {
  width: 0.3rem;
  height: 0.6rem;
}

.auth-building-right {
  width: 0.25rem;
  height: 0.45rem;
}

.auth-window {
  width: 0.06rem;
  height: 0.06rem;
  background: rgba(144, 238, 144, 0.8);
  border-radius: 0.015rem;
}

.auth-logo-leaf {
  position: absolute;
  bottom: -0.08rem;
  left: 0.08rem;
  width: 0.25rem;
  height: 0.3rem;
  background: linear-gradient(45deg, rgba(144, 238, 144, 0.8) 0%, rgba(34, 139, 34, 0.8) 100%);
  border-radius: 0 100% 0 100%;
  transform: rotate(-45deg);
}

.auth-logo-leaf::before {
  content: '';
  position: absolute;
  top: 0.2rem;
  left: 0.08rem;
  width: 0.04rem;
  height: 0.12rem;
  background: rgba(34, 139, 34, 0.8);
  border-radius: 0.02rem;
}

.auth-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.auth-sparkle {
  position: absolute;
  background: rgba(144, 238, 144, 0.6);
  border-radius: 50%;
  animation: authSparkle 2s ease-in-out infinite;
}

.auth-sparkle-1 {
  width: 0.06rem;
  height: 0.06rem;
  top: 0.15rem;
  right: 0.25rem;
  animation-delay: 0s;
}

.auth-sparkle-2 {
  width: 0.05rem;
  height: 0.05rem;
  top: 0.3rem;
  left: 0.15rem;
  animation-delay: 0.5s;
}

.auth-sparkle-3 {
  width: 0.04rem;
  height: 0.04rem;
  top: 0.08rem;
  left: 0.3rem;
  animation-delay: 1s;
}

.auth-sparkle-4 {
  width: 0.05rem;
  height: 0.05rem;
  top: 0.35rem;
  right: 0.08rem;
  animation-delay: 1.5s;
}

@keyframes authSparkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.brand-initials {
  font-weight: 700;
  font-size: var(--font-size-lg);
  letter-spacing: 0.05em;
}

.brand-title {
  margin: 0;
  font-size: var(--font-size-4xl);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  margin: 0.75rem 0 0 0;
  font-size: var(--font-size-lg);
  opacity: 0.9;
  font-weight: 400;
  line-height: 1.5;
}

.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-xl);
  background: var(--bg-primary);
}

.panel-card {
  width: 100%;
  max-width: 28rem;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.panel-header {
  padding: var(--spacing-xl) var(--spacing-xl) 0 var(--spacing-xl);
  text-align: center;
}

.panel-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.panel-desc {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-muted);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.panel-body {
  padding: 0 var(--spacing-xl) var(--spacing-xl) var(--spacing-xl);
}

.form-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.input {
  display: grid;
  gap: var(--spacing-sm);
}

.input label {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  letter-spacing: 0.025em;
}

.input input,
.input select,
.input textarea {
  width: 100%;
  padding: 0.875rem var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-muted);
  outline: none;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.input input:focus,
.input select:focus,
.input textarea:focus {
  border-color: var(--primary-color);
  box-shadow:
    0 0 0 3px rgba(6, 158, 45, 0.1),
    var(--shadow-md);
  background: var(--bg-primary);
}

.input input::placeholder,
.input textarea::placeholder {
  color: var(--text-muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 0.875rem var(--spacing-lg);
  border: 0;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-base);
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-hover);
}

.muted-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: var(--transition);
}

.muted-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-hero {
    min-height: 20rem;
    padding: var(--spacing-xl);
  }

  .hero-card {
    max-width: 100%;
  }

  .brand-title {
    font-size: var(--font-size-3xl);
  }

  .brand-subtitle {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 640px) {
  .auth-hero {
    padding: var(--spacing-lg);
    min-height: 16rem;
  }

  .auth-panel {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .panel-card {
    max-width: 100%;
  }

  .panel-header {
    padding: var(--spacing-lg) var(--spacing-lg) 0 var(--spacing-lg);
  }

  .panel-body {
    padding: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
  }

  .brand {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .brand-title {
    font-size: var(--font-size-2xl);
  }

  .panel-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
