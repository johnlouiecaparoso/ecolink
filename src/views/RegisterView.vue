<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue'
</script>

<template>
  <div class="auth-layout">
    <section class="auth-hero">
      <div class="hero-card">
        <div class="brand">
          <div class="brand-badge">
            <!-- New EcoLink Logo for Auth Pages -->
            <div class="auth-logo">
              <div class="auth-logo-cloud">
                <div class="auth-logo-buildings">
                  <div class="auth-building auth-building-left">
                    <div class="auth-window"></div>
                    <div class="auth-window"></div>
                    <div class="auth-window"></div>
                  </div>
                  <div class="auth-building auth-building-right">
                    <div class="auth-window"></div>
                    <div class="auth-window"></div>
                  </div>
                </div>
                <div class="auth-logo-leaf"></div>
              </div>
              <div class="auth-sparkles">
                <div class="auth-sparkle auth-sparkle-1"></div>
                <div class="auth-sparkle auth-sparkle-2"></div>
                <div class="auth-sparkle auth-sparkle-3"></div>
                <div class="auth-sparkle auth-sparkle-4"></div>
              </div>
            </div>
          </div>
          <div>
            <h1 class="brand-title">ECOLINK</h1>
            <p class="brand-subtitle">Join the network accelerating climate-positive projects.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="auth-panel">
      <div class="panel-card">
        <div class="panel-header">
          <h2 class="panel-title">Create your account</h2>
          <p class="panel-desc">Get started with EcoLink in minutes.</p>
        </div>
        <div class="panel-body">
          <RegisterForm />
          <div style="margin-top: 14px; text-align: center">
            <span class="panel-desc">Already have an account?</span>
            <router-link class="muted-link" to="/login" style="margin-left: 8px"
              >Sign in</router-link
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
