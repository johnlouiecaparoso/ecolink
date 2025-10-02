import { getSupabase } from '@/services/supabaseClient'

/**
 * Get platform overview statistics
 */
export async function getPlatformOverview() {
  const supabase = getSupabase()

  try {
    // Get counts for different entities
    const [
      { count: totalProjects },
      { count: activeProjects },
      { count: totalUsers },
      { count: totalTransactions },
      { count: totalCreditsSold },
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('credit_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      supabase.from('credit_ownership').select('*', { count: 'exact', head: true }),
    ])

    // Get revenue data
    const { data: revenueData } = await supabase
      .from('credit_transactions')
      .select('total_amount, currency')
      .eq('status', 'completed')

    const totalRevenue =
      revenueData?.reduce((sum, transaction) => {
        // Convert to PHP if needed (simple conversion for demo)
        const amount =
          transaction.currency === 'USD' ? transaction.total_amount * 56 : transaction.total_amount
        return sum + amount
      }, 0) || 0

    return {
      totalProjects: totalProjects || 0,
      activeProjects: activeProjects || 0,
      totalUsers: totalUsers || 0,
      totalTransactions: totalTransactions || 0,
      totalCreditsSold: totalCreditsSold || 0,
      totalRevenue: Math.round(totalRevenue),
      currency: 'PHP',
    }
  } catch (error) {
    console.error('Error fetching platform overview:', error)
    throw new Error('Failed to fetch platform overview')
  }
}

/**
 * Get project statistics by status
 */
export async function getProjectStats() {
  const supabase = getSupabase()

  try {
    const { data: projects } = await supabase.from('projects').select('status, created_at')

    if (!projects) return { byStatus: {}, byMonth: [] }

    // Group by status
    const byStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {})

    // Group by month (last 12 months)
    const byMonth = projects.reduce((acc, project) => {
      const date = new Date(project.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!acc[monthKey]) {
        acc[monthKey] = 0
      }
      acc[monthKey]++
      return acc
    }, {})

    // Convert to array format for charts
    const monthlyData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, count]) => ({
        month,
        count,
      }))

    return {
      byStatus,
      byMonth: monthlyData,
    }
  } catch (error) {
    console.error('Error fetching project stats:', error)
    throw new Error('Failed to fetch project statistics')
  }
}

/**
 * Get credit trading statistics
 */
export async function getCreditStats() {
  const supabase = getSupabase()

  try {
    // Get credit listings data
    const { data: listings } = await supabase
      .from('credit_listings')
      .select('quantity, price_per_credit, currency, status')

    // Get transaction data
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('quantity, total_amount, currency, created_at, status')
      .eq('status', 'completed')

    if (!listings || !transactions) {
      return {
        totalCreditsAvailable: 0,
        totalCreditsSold: 0,
        averagePrice: 0,
        totalVolume: 0,
        monthlyVolume: [],
      }
    }

    // Calculate statistics
    const totalCreditsAvailable = listings
      .filter((l) => l.status === 'active')
      .reduce((sum, listing) => sum + parseFloat(listing.quantity), 0)

    const totalCreditsSold = transactions.reduce(
      (sum, transaction) => sum + parseFloat(transaction.quantity),
      0,
    )

    const totalVolume = transactions.reduce((sum, transaction) => {
      const amount =
        transaction.currency === 'USD' ? transaction.total_amount * 56 : transaction.total_amount
      return sum + amount
    }, 0)

    const averagePrice = totalCreditsSold > 0 ? totalVolume / totalCreditsSold : 0

    // Monthly volume data
    const monthlyVolume = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!acc[monthKey]) {
        acc[monthKey] = { credits: 0, volume: 0 }
      }

      acc[monthKey].credits += parseFloat(transaction.quantity)
      const amount =
        transaction.currency === 'USD' ? transaction.total_amount * 56 : transaction.total_amount
      acc[monthKey].volume += amount

      return acc
    }, {})

    const monthlyData = Object.entries(monthlyVolume)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({
        month,
        credits: data.credits,
        volume: Math.round(data.volume),
      }))

    return {
      totalCreditsAvailable: Math.round(totalCreditsAvailable),
      totalCreditsSold: Math.round(totalCreditsSold),
      averagePrice: Math.round(averagePrice),
      totalVolume: Math.round(totalVolume),
      monthlyVolume: monthlyData,
    }
  } catch (error) {
    console.error('Error fetching credit stats:', error)
    throw new Error('Failed to fetch credit statistics')
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  const supabase = getSupabase()

  try {
    const { data: users } = await supabase.from('profiles').select('role, created_at')

    if (!users) return { byRole: {}, byMonth: [] }

    // Group by role
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})

    // Group by month
    const byMonth = users.reduce((acc, user) => {
      const date = new Date(user.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!acc[monthKey]) {
        acc[monthKey] = 0
      }
      acc[monthKey]++
      return acc
    }, {})

    const monthlyData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({
        month,
        count,
      }))

    return {
      byRole,
      byMonth: monthlyData,
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw new Error('Failed to fetch user statistics')
  }
}

/**
 * Get revenue analytics
 */
export async function getRevenueStats() {
  const supabase = getSupabase()

  try {
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('total_amount, transaction_fee, currency, created_at, status')
      .eq('status', 'completed')

    if (!transactions) {
      return {
        totalRevenue: 0,
        totalFees: 0,
        monthlyRevenue: [],
      }
    }

    const totalRevenue = transactions.reduce((sum, transaction) => {
      const amount =
        transaction.currency === 'USD' ? transaction.total_amount * 56 : transaction.total_amount
      return sum + amount
    }, 0)

    const totalFees = transactions.reduce((sum, transaction) => {
      const fee =
        transaction.currency === 'USD'
          ? transaction.transaction_fee * 56
          : transaction.transaction_fee
      return sum + (fee || 0)
    }, 0)

    // Monthly revenue
    const monthlyRevenue = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!acc[monthKey]) {
        acc[monthKey] = 0
      }

      const amount =
        transaction.currency === 'USD' ? transaction.total_amount * 56 : transaction.total_amount
      acc[monthKey] += amount

      return acc
    }, {})

    const monthlyData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue),
      }))

    return {
      totalRevenue: Math.round(totalRevenue),
      totalFees: Math.round(totalFees),
      monthlyRevenue: monthlyData,
    }
  } catch (error) {
    console.error('Error fetching revenue stats:', error)
    throw new Error('Failed to fetch revenue statistics')
  }
}

/**
 * Get top performing projects
 */
export async function getTopProjects() {
  const supabase = getSupabase()

  try {
    const { data: projects } = await supabase
      .from('projects')
      .select(
        `
        id,
        title,
        category,
        status,
        created_at,
        project_credits (
          credits_sold,
          total_credits,
          price_per_credit
        )
      `,
      )
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!projects) return []

    return projects
      .map((project) => ({
        id: project.id,
        title: project.title,
        category: project.category,
        creditsSold: project.project_credits?.[0]?.credits_sold || 0,
        totalCredits: project.project_credits?.[0]?.total_credits || 0,
        pricePerCredit: project.project_credits?.[0]?.price_per_credit || 0,
        revenue:
          (project.project_credits?.[0]?.credits_sold || 0) *
          (project.project_credits?.[0]?.price_per_credit || 0),
        createdAt: project.created_at,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  } catch (error) {
    console.error('Error fetching top projects:', error)
    throw new Error('Failed to fetch top projects')
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity() {
  const supabase = getSupabase()

  try {
    // Get recent projects
    const { data: recentProjects } = await supabase
      .from('projects')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent transactions
    const { data: recentTransactions } = await supabase
      .from('credit_transactions')
      .select('id, quantity, total_amount, currency, created_at, status')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5)

    const activities = []

    // Add project activities
    if (recentProjects) {
      recentProjects.forEach((project) => {
        activities.push({
          id: `project-${project.id}`,
          type: 'project',
          action: project.status === 'approved' ? 'approved' : 'submitted',
          title: project.title,
          timestamp: project.created_at,
          status: project.status,
        })
      })
    }

    // Add transaction activities
    if (recentTransactions) {
      recentTransactions.forEach((transaction) => {
        activities.push({
          id: `transaction-${transaction.id}`,
          type: 'transaction',
          action: 'purchase',
          title: `${transaction.quantity} credits purchased`,
          timestamp: transaction.created_at,
          amount: transaction.total_amount,
          currency: transaction.currency,
        })
      })
    }

    // Sort by timestamp and return latest 10
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    throw new Error('Failed to fetch recent activity')
  }
}

/**
 * Generate analytics report
 */
export async function generateAnalyticsReport() {
  try {
    const [
      overview,
      projectStats,
      creditStats,
      userStats,
      revenueStats,
      topProjects,
      recentActivity,
    ] = await Promise.all([
      getPlatformOverview(),
      getProjectStats(),
      getCreditStats(),
      getUserStats(),
      getRevenueStats(),
      getTopProjects(),
      getRecentActivity(),
    ])

    return {
      overview,
      projectStats,
      creditStats,
      userStats,
      revenueStats,
      topProjects,
      recentActivity,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error generating analytics report:', error)
    throw new Error('Failed to generate analytics report')
  }
}









