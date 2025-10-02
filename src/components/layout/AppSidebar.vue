<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <h3>Navigation</h3>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/projects">Projects</a></li>
        <li><a href="/analytics">Analytics</a></li>
        <li><a href="/admin">Admin</a></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
// App sidebar component
</script>

<style scoped>
.app-sidebar {
  width: 250px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  padding: 1rem;
  min-height: 100vh;
}

.sidebar-header h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 0.5rem;
}

.sidebar-nav a {
  display: block;
  padding: 0.5rem 1rem;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar-nav a:hover {
  background-color: #e9ecef;
  color: #333;
}
</style>
