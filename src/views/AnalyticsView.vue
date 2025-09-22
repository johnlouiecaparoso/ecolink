<script setup>
import { useRouter } from 'vue-router'
import PageLayout from '@/components/layout/PageLayout.vue'

const router = useRouter()
</script>

<template>
  <PageLayout>
    <div class="analytics-content">
      <div class="content-header">
        <div class="header-info">
          <button class="btn btn-ghost back-btn" @click="router.push('/dashboard')">
            <span class="back-icon">←</span>
            Back to Dashboard
          </button>
          <h1 class="page-title">Analytics & Reports</h1>
          <p class="page-subtitle">View insights and generate reports</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary">📊 Generate Report</button>
        </div>
      </div>

      <div class="analytics-grid">
        <!-- Key Metrics -->
        <div class="metrics-cards">
          <div class="metric-card">
            <div class="metric-icon">🌱</div>
            <div class="metric-content">
              <h3>Active Projects</h3>
              <p class="metric-number">47</p>
              <span class="metric-change positive">+12%</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <h3>Total Revenue</h3>
              <p class="metric-number">₱2.4M</p>
              <span class="metric-change positive">+8%</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">👥</div>
            <div class="metric-content">
              <h3>Active Users</h3>
              <p class="metric-number">1,156</p>
              <span class="metric-change positive">+5%</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🌍</div>
            <div class="metric-content">
              <h3>CO2 Reduced</h3>
              <p class="metric-number">2.3K tons</p>
              <span class="metric-change positive">+15%</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Project Performance</h3>
              <div class="chart-controls">
                <select class="period-select">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>
            </div>
            <div class="chart-content">
              <div class="placeholder-chart">
                <div class="chart-icon">📈</div>
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>Revenue Trends</h3>
              <div class="chart-controls">
                <select class="period-select">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </select>
              </div>
            </div>
            <div class="chart-content">
              <div class="placeholder-chart">
                <div class="chart-icon">💹</div>
                <p>Revenue chart coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports Section -->
        <div class="reports-section">
          <div class="reports-card">
            <div class="card-header">
              <h3>Available Reports</h3>
              <button class="btn btn-secondary">+ Create Custom Report</button>
            </div>
            <div class="reports-grid">
              <div class="report-item">
                <div class="report-icon">📋</div>
                <div class="report-info">
                  <h4>Monthly Summary</h4>
                  <p>Overview of all activities and metrics</p>
                </div>
                <button class="btn btn-ghost">Download</button>
              </div>
              <div class="report-item">
                <div class="report-icon">🌱</div>
                <div class="report-info">
                  <h4>Project Analysis</h4>
                  <p>Detailed project performance report</p>
                </div>
                <button class="btn btn-ghost">Download</button>
              </div>
              <div class="report-item">
                <div class="report-icon">👥</div>
                <div class="report-info">
                  <h4>User Activity</h4>
                  <p>User engagement and activity metrics</p>
                </div>
                <button class="btn btn-ghost">Download</button>
              </div>
              <div class="report-item">
                <div class="report-icon">💰</div>
                <div class="report-info">
                  <h4>Financial Report</h4>
                  <p>Revenue, expenses, and financial metrics</p>
                </div>
                <button class="btn btn-ghost">Download</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--ecolink-border);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.back-btn:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #10b981;
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

.header-info {
  flex: 1;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--ecolink-text);
}

.page-subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--ecolink-muted);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.analytics-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-md);
}

.metric-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ecolink-primary-50);
  border-radius: 8px;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ecolink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-number {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ecolink-text);
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.metric-change.positive {
  background: #d1fae5;
  color: #065f46;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--ecolink-primary-50);
  border-bottom: 1px solid var(--ecolink-primary-200);
}

.chart-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ecolink-primary-700);
}

.chart-controls {
  display: flex;
  gap: 1rem;
}

.period-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--ecolink-border);
  border-radius: 6px;
  background: var(--ecolink-surface);
  color: var(--ecolink-text);
  font-size: 0.875rem;
}

.chart-content {
  padding: 2rem;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-chart {
  text-align: center;
  color: var(--ecolink-muted);
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.reports-section {
  margin-top: 1rem;
}

.reports-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--ecolink-primary-50);
  border-bottom: 1px solid var(--ecolink-primary-200);
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ecolink-primary-700);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--ecolink-bg);
  border: 1px solid var(--ecolink-border);
  border-radius: 8px;
  transition: all 0.2s;
}

.report-item:hover {
  background: var(--ecolink-primary-50);
  border-color: var(--ecolink-primary-300);
}

.report-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ecolink-primary-100);
  border-radius: 6px;
}

.report-info {
  flex: 1;
  min-width: 0;
}

.report-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ecolink-text);
}

.report-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ecolink-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .metrics-cards {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
