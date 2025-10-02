<script setup>
import { ref, computed } from 'vue'
import PortfolioChart from '@/components/charts/PortfolioChart.vue'
import CategoryChart from '@/components/charts/CategoryChart.vue'

// Chart data
const portfolioChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Portfolio Value ($)',
      data: [8500, 9200, 8800, 10500, 11200, 10800, 12450, 11800, 13200, 12800, 13500, 12450],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
})

const portfolioChartOptions = ref({
  plugins: {
    title: {
      display: true,
      text: 'Portfolio Value Over Time',
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      min: 8000,
      ticks: {
        callback: function (value) {
          return '$' + value.toLocaleString()
        },
      },
    },
  },
})

const categoryChartData = ref({
  labels: ['Forestry', 'Renewable Energy', 'Blue Carbon', 'Energy Efficiency', 'Waste Management'],
  datasets: [
    {
      data: [35, 25, 15, 15, 10],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
    },
  ],
})

const categoryChartOptions = ref({
  plugins: {
    title: {
      display: true,
      text: 'Credit Purchases by Category (%)',
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return context.label + ': ' + context.parsed + '%'
        },
      },
    },
  },
})
</script>

<template>
  <div class="analytics-view">
    <div class="container">
      <h1 class="page-title">Analytics Dashboard</h1>
      <p class="page-description">Track your carbon credit portfolio performance and impact.</p>

      <!-- Analytics Cards -->
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="card-header">
            <h3>Portfolio Value</h3>
            <span class="card-icon">💰</span>
          </div>
          <div class="card-content">
            <div class="metric-value">$12,450</div>
            <div class="metric-change positive">+12.5%</div>
          </div>
        </div>

        <div class="analytics-card">
          <div class="card-header">
            <h3>Credits Purchased</h3>
            <span class="card-icon">🌱</span>
          </div>
          <div class="card-content">
            <div class="metric-value">1,250</div>
            <div class="metric-change positive">+50 this month</div>
          </div>
        </div>

        <div class="analytics-card">
          <div class="card-header">
            <h3>CO₂ Offset</h3>
            <span class="card-icon">🌍</span>
          </div>
          <div class="card-content">
            <div class="metric-value">1,250 tons</div>
            <div class="metric-change positive">Equivalent to 2,500 trees</div>
          </div>
        </div>

        <div class="analytics-card">
          <div class="card-header">
            <h3>Projects Supported</h3>
            <span class="card-icon">🏗️</span>
          </div>
          <div class="card-content">
            <div class="metric-value">8</div>
            <div class="metric-change positive">Across 5 countries</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>Portfolio Performance</h3>
          <PortfolioChart :data="portfolioChartData" :options="portfolioChartOptions" />
        </div>

        <div class="chart-card">
          <h3>Credit Purchases by Category</h3>
          <CategoryChart :data="categoryChartData" :options="categoryChartOptions" />
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">🛒</div>
            <div class="activity-content">
              <div class="activity-title">Purchased 50 credits</div>
              <div class="activity-description">Amazon Rainforest Protection Initiative</div>
              <div class="activity-time">2 hours ago</div>
            </div>
            <div class="activity-value">$750</div>
          </div>

          <div class="activity-item">
            <div class="activity-icon">📈</div>
            <div class="activity-content">
              <div class="activity-title">Portfolio value increased</div>
              <div class="activity-description">Your portfolio gained 5.2% this week</div>
              <div class="activity-time">1 day ago</div>
            </div>
            <div class="activity-value positive">+$650</div>
          </div>

          <div class="activity-item">
            <div class="activity-icon">🌱</div>
            <div class="activity-content">
              <div class="activity-title">Credits retired</div>
              <div class="activity-description">100 credits retired for carbon neutrality</div>
              <div class="activity-time">3 days ago</div>
            </div>
            <div class="activity-value">-100 credits</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-view {
  padding: 2rem 0;
  min-height: 100vh;
  background: var(--bg-secondary);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.analytics-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.analytics-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-icon {
  font-size: 1.5rem;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.metric-change {
  font-size: 0.875rem;
  font-weight: 500;
}

.metric-change.positive {
  color: #10b981;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.activity-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-muted);
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.activity-value {
  font-weight: 600;
  color: var(--text-primary);
}

.activity-value.positive {
  color: #10b981;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
