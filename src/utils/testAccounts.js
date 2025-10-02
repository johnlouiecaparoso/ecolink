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
        id: 'admin-test-123',
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
        id: 'verifier-test-123',
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
        id: 'user-test-123',
        email: 'user@ecolink.test',
        user_metadata: { name: 'General User' },
      },
      access_token: 'user-test-token',
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
