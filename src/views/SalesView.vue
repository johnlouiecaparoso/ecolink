<template>
  <div class="sales-view">
    <div class="page-header">
      <h1 class="page-title">Sales Dashboard</h1>
      <p class="page-description">Track your project sales and credit issuance</p>
    </div>

    <div class="sales-content">
      <!-- Sales Overview Cards -->
      <div class="sales-overview">
        <div class="overview-card">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3 class="card-title">Total Revenue</h3>
            <p class="card-value">₱{{ totalRevenue.toLocaleString() }}</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">🌱</div>
          <div class="card-content">
            <h3 class="card-title">Credits Issued</h3>
            <p class="card-value">{{ totalCredits.toLocaleString() }}</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h3 class="card-title">Active Projects</h3>
            <p class="card-value">{{ activeProjects }}</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <h3 class="card-title">Completed Sales</h3>
            <p class="card-value">{{ completedSales }}</p>
          </div>
        </div>
      </div>

      <!-- Sales Chart -->
      <div class="sales-chart">
        <h3 class="section-title">Sales Trend</h3>
        <div class="chart-placeholder">
          <p>Sales chart would be displayed here</p>
        </div>
      </div>

      <!-- Recent Sales Table -->
      <div class="recent-sales">
        <h3 class="section-title">Recent Sales</h3>
        <div class="sales-table">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Buyer</th>
                <th>Credits</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in recentSales" :key="sale.id">
                <td>{{ sale.project }}</td>
                <td>{{ sale.buyer }}</td>
                <td>{{ sale.credits }}</td>
                <td>₱{{ sale.amount.toLocaleString() }}</td>
                <td>{{ formatDate(sale.date) }}</td>
                <td>
                  <span class="status-badge" :class="sale.status">
                    {{ sale.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Project Performance -->
      <div class="project-performance">
        <h3 class="section-title">Project Performance</h3>
        <div class="projects-grid">
          <div v-for="project in projects" :key="project.id" class="project-card">
            <div class="project-header">
              <h4 class="project-name">{{ project.name }}</h4>
              <span class="project-status" :class="project.status">
                {{ project.status }}
              </span>
            </div>
            <div class="project-metrics">
              <div class="metric">
                <span class="metric-label">Credits Sold</span>
                <span class="metric-value">{{ project.creditsSold }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Revenue</span>
                <span class="metric-value">₱{{ project.revenue.toLocaleString() }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Completion</span>
                <span class="metric-value">{{ project.completion }}%</span>
              </div>
            </div>
            <div class="project-actions">
              <button class="btn btn-primary" @click="viewProject(project)">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { formatDate } from '@/utils/formatDate'

export default {
  name: 'SalesView',
  setup() {
    const totalRevenue = ref(125000)
    const totalCredits = ref(2500)
    const activeProjects = ref(8)
    const completedSales = ref(45)

    const recentSales = ref([
      {
        id: 1,
        project: 'Solar Farm Project',
        buyer: 'John Doe',
        credits: 100,
        amount: 5000,
        date: new Date('2024-01-15'),
        status: 'completed',
      },
      {
        id: 2,
        project: 'Wind Energy Initiative',
        buyer: 'Jane Smith',
        credits: 75,
        amount: 3750,
        date: new Date('2024-01-14'),
        status: 'pending',
      },
      {
        id: 3,
        project: 'Reforestation Program',
        buyer: 'Mike Johnson',
        credits: 200,
        amount: 10000,
        date: new Date('2024-01-13'),
        status: 'completed',
      },
    ])

    const projects = ref([
      {
        id: 1,
        name: 'Solar Farm Project',
        status: 'active',
        creditsSold: 500,
        revenue: 25000,
        completion: 75,
      },
      {
        id: 2,
        name: 'Wind Energy Initiative',
        status: 'active',
        creditsSold: 300,
        revenue: 15000,
        completion: 60,
      },
      {
        id: 3,
        name: 'Reforestation Program',
        status: 'completed',
        creditsSold: 1000,
        revenue: 50000,
        completion: 100,
      },
    ])

    const viewProject = (project) => {
      console.log('Viewing project:', project.name)
      // Implement view project functionality
    }

    onMounted(() => {
      // Load sales data
    })

    return {
      totalRevenue,
      totalCredits,
      activeProjects,
      completedSales,
      recentSales,
      projects,
      viewProject,
      formatDate,
    }
  },
}
</script>

<style scoped>
.sales-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #718096;
  font-size: 1.1rem;
}

.sales-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 8px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.sales-chart {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
}

.chart-placeholder {
  height: 300px;
  background: #f7fafc;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
}

.recent-sales {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.sales-table {
  overflow-x: auto;
}

.sales-table table {
  width: 100%;
  border-collapse: collapse;
}

.sales-table th,
.sales-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.sales-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.sales-table td {
  color: #2d3748;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.pending {
  background: #fed7d7;
  color: #742a2a;
}

.project-performance {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f7fafc;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.project-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.project-status.active {
  background: #c6f6d5;
  color: #22543d;
}

.project-status.completed {
  background: #bee3f8;
  color: #2a4365;
}

.project-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric {
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.metric-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
}

.project-actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5aa0;
}
</style>
