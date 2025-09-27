import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the auth service dependencies
vi.mock('@/services/auditService', () => ({
  logUserAction: vi.fn(),
  logSystemEvent: vi.fn(),
}))

vi.mock('@/services/emailService', () => ({
  sendWelcomeEmail: vi.fn(),
}))

// Mock Supabase client
vi.mock('@/services/supabaseClient', () => ({
  getSupabase: vi.fn(),
}))

// Import after mocking
import { loginWithEmail, registerWithEmail } from '@/services/authService'

describe('AuthService', () => {
  let mockSupabase
  let getSupabase

  beforeEach(async () => {
    vi.clearAllMocks()

    // Get the mocked function
    const { getSupabase: mockGetSupabase } = await import('@/services/supabaseClient')
    getSupabase = mockGetSupabase

    // Create fresh mock for each test
    mockSupabase = {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
      },
    }

    getSupabase.mockReturnValue(mockSupabase)
  })

  describe('loginWithEmail', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const result = await loginWithEmail({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.user).toEqual(mockUser)
    })

    it('should throw error for invalid credentials', async () => {
      const mockError = new Error('Invalid credentials')

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(
        loginWithEmail({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid credentials')
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')

      mockSupabase.auth.signInWithPassword.mockRejectedValue(networkError)

      await expect(
        loginWithEmail({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Network error')
    })
  })

  describe('registerWithEmail', () => {
    it('should successfully register a new user', async () => {
      const mockUser = { id: '123', email: 'newuser@example.com' }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await registerWithEmail({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: { name: 'New User' },
          emailRedirectTo: expect.any(String),
        },
      })
      expect(result.user).toEqual(mockUser)
    })

    it('should throw error for existing email', async () => {
      const mockError = new Error('User already registered')

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(
        registerWithEmail({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('User already registered')
    })

    it('should validate email format', async () => {
      await expect(
        registerWithEmail({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        }),
      ).rejects.toThrow()
    })

    it('should validate password strength', async () => {
      await expect(
        registerWithEmail({
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
        }),
      ).rejects.toThrow()
    })
  })
})
