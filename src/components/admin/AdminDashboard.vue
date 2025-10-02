<template>
  <div class="admin-dashboard">
    <div class="admin-stats">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-number">1,234</p>
      </div>
      <div class="stat-card">
        <h3>Active Projects</h3>
        <p class="stat-number">45</p>
      </div>
      <div class="stat-card">
        <h3>Total Credits</h3>
        <p class="stat-number">125,000</p>
      </div>
      <div class="stat-card">
        <h3>Revenue</h3>
        <p class="stat-number">$2.5M</p>
      </div>
    </div>

    <div class="admin-content">
      <div class="admin-section">
        <h2>System Overview</h2>
        <p>Admin dashboard functionality would be implemented here.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Admin dashboard component
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.stat-number {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.admin-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-section h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.admin-section p {
  color: #666;
  line-height: 1.5;
}
</style>
