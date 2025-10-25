// Test accounts for development and testing
import { ROLES } from '@/constants/roles'

export const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@ecolink.test',
    password: 'admin123',
    name: 'Admin User',
    role: ROLES.ADMIN,
    mockSession: {
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@ecolink.test',
        user_metadata: { name: 'Admin User' },
      },
      access_token: 'admin-test-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  },
  verifier: {
    email: 'verifier@ecolink.test',
    password: 'verifier123',
    name: 'Verifier User',
    role: ROLES.VERIFIER,
    mockSession: {
      user: {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'verifier@ecolink.test',
        user_metadata: { name: 'Verifier User' },
      },
      access_token: 'verifier-test-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  },
  user: {
    email: 'user@ecolink.test',
    password: 'user123',
    name: 'General User',
    role: ROLES.GENERAL_USER,
    mockSession: {
      user: {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'user@ecolink.test',
        user_metadata: { name: 'General User' },
      },
      access_token: 'user-test-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  },
  projectDeveloper: {
    email: 'developer@ecolink.test',
    password: 'developer123',
    name: 'Project Developer',
    role: ROLES.PROJECT_DEVELOPER,
    mockSession: {
      user: {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'developer@ecolink.test',
        user_metadata: { name: 'Project Developer' },
      },
      access_token: 'developer-test-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  },
}

// Helper function to get test account by role
export function getTestAccount(role) {
  return Object.values(TEST_ACCOUNTS).find((account) => account.role === role)
}

// Helper function to check if email is a test account
export function isTestAccount(email) {
  return Object.values(TEST_ACCOUNTS).some((account) => account.email === email)
}

// Helper function to get test account by email
export function getTestAccountByEmail(email) {
  return Object.values(TEST_ACCOUNTS).find((account) => account.email === email)
}
