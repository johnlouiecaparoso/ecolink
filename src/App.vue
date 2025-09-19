<script setup></script>

<template>
  <router-view />
</template>

<style>
:root {
  --ecolink-primary-500: #069e2d;
  --ecolink-primary-600: #058e3f;
  --ecolink-primary-700: #04773b;
  --ecolink-bg: #f4fff7;
  --ecolink-surface: #ffffff;
  --ecolink-text: #0d1b12;
  --ecolink-muted: #5b6b62;
  --ecolink-border: #e2efe6;
  --radius: 14px;
  --shadow-lg: 0 20px 40px rgba(4, 119, 59, 0.12);
  --shadow-md: 0 12px 24px rgba(4, 119, 59, 0.1);
}

html,
body,
#app {
  height: 100%;
}

body {
  margin: 0;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    'Apple Color Emoji',
    'Segoe UI Emoji';
  color: var(--ecolink-text);
  background:
    radial-gradient(1200px 800px at 10% -10%, rgba(6, 158, 45, 0.12), transparent 40%),
    radial-gradient(1000px 700px at 110% 10%, rgba(5, 142, 63, 0.1), transparent 40%),
    var(--ecolink-bg);
}

.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
}

.auth-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(180deg, var(--ecolink-primary-600), var(--ecolink-primary-700));
  color: white;
}

.hero-card {
  max-width: 560px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ecolink-primary-500), var(--ecolink-primary-700));
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.brand-initials {
  font-weight: 800;
  letter-spacing: 0.5px;
}

.brand-title {
  margin: 0;
  font-size: 34px;
  line-height: 1.1;
  font-weight: 800;
}

.brand-subtitle {
  margin: 10px 0 0 0;
  font-size: 16px;
  opacity: 0.9;
}

.auth-panel {
  display: grid;
  place-items: center;
  padding: 40px 28px;
}

.panel-card {
  width: 100%;
  max-width: 520px;
  background: var(--ecolink-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--ecolink-border);
  overflow: hidden;
}

.panel-header {
  padding: 28px 28px 0 28px;
}

.panel-title {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 800;
  color: var(--ecolink-primary-700);
}

.panel-desc {
  margin: 0 0 18px 0;
  color: var(--ecolink-muted);
}

.panel-body {
  padding: 0 28px 28px 28px;
}

.form-grid {
  display: grid;
  gap: 14px;
}

.input {
  display: grid;
  gap: 8px;
}

.input label {
  font-weight: 600;
  font-size: 14px;
}

.input input,
.input select,
.input textarea {
  width: 100%;
  padding: 14px 14px;
  border-radius: 12px;
  border: 1px solid var(--ecolink-border);
  background: #fff;
  outline: none;
  transition:
    box-shadow 160ms ease,
    border-color 160ms ease;
}

.input input:focus,
.input select:focus,
.input textarea:focus {
  border-color: var(--ecolink-primary-500);
  box-shadow: 0 0 0 4px rgba(6, 158, 45, 0.12);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  transition:
    transform 120ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: linear-gradient(180deg, var(--ecolink-primary-500), var(--ecolink-primary-700));
  color: #fff;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  filter: brightness(1.02);
}

.btn-ghost {
  background: transparent;
  color: var(--ecolink-primary-700);
}

.muted-link {
  color: var(--ecolink-primary-600);
  text-decoration: none;
  font-weight: 600;
}

.muted-link:hover {
  text-decoration: underline;
}

@media (max-width: 940px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }
  .auth-hero {
    min-height: 220px;
    padding: 28px;
  }
}
</style>
