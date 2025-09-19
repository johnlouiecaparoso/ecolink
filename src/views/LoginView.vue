<script setup>
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <div class="auth-layout">
    <section class="auth-hero">
      <div class="hero-card">
        <div class="brand">
          <div class="brand-badge">
            <span class="brand-initials">EC</span>
          </div>
          <div>
            <h1 class="brand-title">EcoLink</h1>
            <p class="brand-subtitle">Connecting projects, verifiers, and impact-driven capital.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="auth-panel">
      <div class="panel-card">
        <div class="panel-header">
          <h2 class="panel-title">Welcome back</h2>
          <p class="panel-desc">Sign in to access your EcoLink dashboard.</p>
        </div>
        <div class="panel-body">
          <LoginForm />
          <div style="margin-top: 14px; text-align: center">
            <span class="panel-desc">New to EcoLink?</span>
            <router-link class="muted-link" to="/register" style="margin-left: 8px"
              >Create an account</router-link
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
