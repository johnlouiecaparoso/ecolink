import { getSupabase } from '@/services/supabaseClient'

/**
 * Get platform overview statistics
 */
export async function getPlatformOverview() {
  const supabase = getSupabase()

  if (!supabase) {
    console.error('Supabase client not initialized')
    return {
      totalProjects: 0,
      activeProjects: 0,
      totalUsers: 0,
      totalTransactions: 0,
      totalCreditsSold: 0,
      totalRevenue: 0,
      currency: 'PHP',
    }
  }

  try {
    // First, check current user and their role for debugging
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    console.log('🔍 [Analytics] Current user:', user?.email || 'Not authenticated', userError)

    if (user) {
      // Get user's profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', user.id)
        .single()
      console.log('🔍 [Analytics] User profile:', profile, profileError)
    }

    // Get counts for different entities - properly handle errors
    console.log('🔍 [Analytics] Starting queries...')
    const [
      projectsResult,
      activeProjectsResult,
      usersResult,
      transactionsResult,
      creditsSoldResult,
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

    // Detailed error logging
    console.log('🔍 [Analytics] Query results received')
    console.log('📊 [Analytics] Projects result:', {
      count: projectsResult.count,
      error: projectsResult.error?.message || null,
    })
    console.log('📊 [Analytics] Active projects result:', {
      count: activeProjectsResult.count,
      error: activeProjectsResult.error?.message || null,
    })
    console.log('📊 [Analytics] Users result:', {
      count: usersResult.count,
      error: usersResult.error?.message || null,
      errorDetails: usersResult.error || null,
    })
    console.log('📊 [Analytics] Transactions result:', {
      count: transactionsResult.count,
      error: transactionsResult.error?.message || null,
    })
    console.log('📊 [Analytics] Credits sold result:', {
      count: creditsSoldResult.count,
      error: creditsSoldResult.error?.message || null,
    })

    // Check for errors in each query
    if (projectsResult.error) {
      console.error('❌ Error fetching total projects:', projectsResult.error)
    }
    if (activeProjectsResult.error) {
      console.error('❌ Error fetching active projects:', activeProjectsResult.error)
    }
    if (usersResult.error) {
      console.error('❌ Error fetching total users:', usersResult.error)
      console.error('❌ Users error code:', usersResult.error.code)
      console.error('❌ Users error details:', usersResult.error.details)
      console.error('❌ Users error hint:', usersResult.error.hint)
    }
    if (transactionsResult.error) {
      console.error('❌ Error fetching transactions:', transactionsResult.error)
    }
    if (creditsSoldResult.error) {
      console.error('❌ Error fetching credits sold:', creditsSoldResult.error)
    }

    // Try alternative query for users if first one fails
    let totalUsers = usersResult.error ? 0 : usersResult.count || 0

    // Check if RLS is silently filtering (0 count with no error)
    if (usersResult.count === 0 && !usersResult.error && user) {
      console.warn('⚠️ CRITICAL: Count query returned 0 with NO error!')
      console.warn('⚠️ This means RLS policies are silently filtering all profiles')
      console.warn('⚠️ Checking if we can query own profile...')

      // Check if we can at least query our own profile
      const { data: ownProfile, error: ownProfileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

      if (!ownProfileError && ownProfile) {
        console.log('✅ Can query own profile. Role:', ownProfile.role)
        console.error('❌ PROBLEM: RLS is filtering out all OTHER profiles')
        console.error('❌ The is_admin() function might not recognize you as admin')
        console.error('❌ Your role in database:', ownProfile.role)
        console.error('❌ Expected roles: admin, super_admin, Administrator, Admin')

        // This is definitely an RLS issue - try to get count via select
        const { data: allProfiles, error: selectError } = await supabase
          .from('profiles')
          .select('id')

        if (!selectError && allProfiles && allProfiles.length > 0) {
          totalUsers = allProfiles.length
          console.log('✅ Got count via select query:', totalUsers)
        } else {
          console.error('❌ Cannot query any profiles - RLS is blocking')
        }
      }
    }

    // If count query failed (any error), try alternative methods
    if (usersResult.error) {
      console.warn('⚠️ Profiles count query failed, trying alternative methods...')
      console.warn('⚠️ Error code:', usersResult.error.code)
      console.warn('⚠️ Error message:', usersResult.error.message)

      // Method 1: Try selecting all and counting manually
      console.log('📝 Trying Method 1: Select all profiles and count...')
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')

      if (!profilesError && allProfiles) {
        totalUsers = allProfiles.length
        console.log('✅ Method 1 succeeded, user count:', totalUsers)
      } else {
        console.error('❌ Method 1 failed:', profilesError?.message || profilesError)

        // Method 2: Try selecting with specific columns (sometimes works when * doesn't)
        console.log('📝 Trying Method 2: Select specific columns...')
        const { data: profilesById, error: profilesByIdError } = await supabase
          .from('profiles')
          .select('id, role')

        if (!profilesByIdError && profilesById) {
          totalUsers = profilesById.length
          console.log('✅ Method 2 succeeded, user count:', totalUsers)
        } else {
          console.error('❌ Method 2 failed:', profilesByIdError?.message || profilesByIdError)

          // Method 3: Check if we can query own profile first (verify connection)
          console.log('📝 Trying Method 3: Verify connection with own profile...')
          if (user) {
            const { data: ownProfile, error: ownProfileError } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', user.id)
              .single()

            if (ownProfileError) {
              console.error('❌ Cannot even query own profile:', ownProfileError.message)
              console.error('❌ This suggests RLS policies are blocking ALL access')
              console.error('❌ Please run fix-admin-rls-policies.sql in Supabase')
            } else {
              console.log('✅ Can query own profile. Role:', ownProfile.role)
              console.warn('⚠️ Cannot query all profiles. Likely RLS policy issue.')
              console.warn('⚠️ Your role might not be recognized as admin by RLS policies.')
            }
          }
        }
      }
    }

    const totalProjects = projectsResult.error ? 0 : projectsResult.count || 0
    const activeProjects = activeProjectsResult.error ? 0 : activeProjectsResult.count || 0
    const totalTransactions = transactionsResult.error ? 0 : transactionsResult.count || 0
    const totalCreditsSold = creditsSoldResult.error ? 0 : creditsSoldResult.count || 0

    console.log('✅ [Analytics] Final counts:', {
      totalUsers,
      totalProjects,
      activeProjects,
      totalTransactions,
      totalCreditsSold,
    })

    // Get revenue data
    const { data: revenueData, error: revenueError } = await supabase
      .from('credit_transactions')
      .select('total_amount, currency')
      .eq('status', 'completed')

    if (revenueError) {
      console.error('Error fetching revenue data:', revenueError)
    }

    const totalRevenue =
      revenueData?.reduce((sum, transaction) => {
        // Convert to PHP if needed (simple conversion for demo)
        const amount =
          transaction.currency === 'USD' ? transaction.total_amount * 56 : transaction.total_amount
        return sum + amount
      }, 0) || 0

    return {
      totalProjects,
      activeProjects,
      totalUsers,
      totalTransactions,
      totalCreditsSold,
      totalRevenue: Math.round(totalRevenue),
      currency: 'PHP',
    }
  } catch (error) {
    console.error('Error fetching platform overview:', error)
    return {
      totalProjects: 0,
      activeProjects: 0,
      totalUsers: 0,
      totalTransactions: 0,
      totalCreditsSold: 0,
      totalRevenue: 0,
      currency: 'PHP',
    }
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
