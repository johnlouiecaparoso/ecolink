# Role-Based Access Control System

This document explains how to use the role-based access control (RBAC) system implemented in the EcoLink application.

## Overview

The RBAC system provides:

- **Role-based permissions**: Different user roles with specific permissions
- **Route protection**: Automatic route access control based on user roles
- **Component-level access**: Show/hide UI elements based on permissions
- **Navigation filtering**: Display only relevant menu items for each role

## User Roles

### 1. User (`user`)

- **Default role** for all new registrations
- **Permissions**: View dashboard, manage projects, view marketplace, manage wallet, view/update profile
- **Access**: Basic user functionality

### 2. Verifier (`verifier`)

- **Permissions**: View dashboard, view profile, verify projects, view verifier panel
- **Access**: Project verification and review functionality

### 3. Admin (`admin`)

- **Permissions**: All user permissions + manage users, view analytics, manage database, manage tables, view admin panel, manage system settings
- **Access**: Administrative functions and user management

### 4. Super Admin (`super_admin`)

- **Permissions**: All admin permissions + manage roles, manage all users, system administration
- **Access**: Full system control and role management

## Usage Examples

### 1. Checking User Role

```javascript
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

// Check specific role
if (userStore.role === 'admin') {
  // Admin-specific logic
}

// Using computed properties
if (userStore.isAdmin) {
  // Admin-specific logic
}

if (userStore.isSuperAdmin) {
  // Super admin-specific logic
}

if (userStore.isVerifier) {
  // Verifier-specific logic
}
```

### 2. Checking Permissions

```javascript
import { PERMISSIONS } from '@/constants/roles'

// Check single permission
if (userStore.hasPermission(PERMISSIONS.MANAGE_USERS)) {
  // User can manage users
}

// Check multiple permissions (any)
if (userStore.hasAnyPermission([PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.MANAGE_DATABASE])) {
  // User has at least one of these permissions
}

// Check multiple permissions (all)
if (userStore.hasAllPermissions([PERMISSIONS.MANAGE_USERS, PERMISSIONS.VIEW_ANALYTICS])) {
  // User has all of these permissions
}
```

### 3. Route Protection

Routes are automatically protected based on the `roles` meta property:

```javascript
// In router/index.js
{
  path: '/admin',
  name: 'admin',
  component: AdminView,
  meta: {
    requiresAuth: true,
    roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  }
}
```

### 4. Component-Level Access Control

```vue
<template>
  <div>
    <!-- Show only for admins -->
    <div v-if="userStore.isAdmin">
      <h3>Admin Panel</h3>
      <p>This content is only visible to administrators.</p>
    </div>

    <!-- Show based on permission -->
    <button v-if="userStore.hasPermission(PERMISSIONS.MANAGE_USERS)" @click="manageUsers">
      Manage Users
    </button>

    <!-- Show for specific role -->
    <div v-if="userStore.role === ROLES.VERIFIER">
      <h3>Verification Panel</h3>
      <p>This content is only visible to verifiers.</p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/userStore'
import { ROLES, PERMISSIONS } from '@/constants/roles'

const userStore = useUserStore()
</script>
```

### 5. Navigation Filtering

The navigation automatically filters menu items based on user permissions:

```javascript
// In AppSidebar.vue
const navItems = computed(() => {
  return allNavItems.filter((item) => {
    if (!item.permission) return true
    return store.hasPermission(item.permission)
  })
})
```

## Managing User Roles

### 1. Updating User Role (Admin Only)

```javascript
import { roleService } from '@/services/roleService'

// Update user role
const success = await roleService.updateUserRole(userId, 'admin')
if (success) {
  console.log('User role updated successfully')
}
```

### 2. Getting All Users with Roles

```javascript
// Get all users (admin only)
const users = await roleService.getAllUsersWithRoles()
console.log(users)
```

### 3. Getting Role Statistics

```javascript
// Get role distribution statistics
const stats = await roleService.getRoleStatistics()
console.log(stats) // { user: 10, admin: 2, verifier: 1 }
```

## Database Schema

The role system uses the `profiles` table with the following structure:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'verifier', 'admin', 'super_admin')),
  kyc_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Considerations

1. **Server-side validation**: Always validate permissions on the server side
2. **Role hierarchy**: Super admins can assign any role, admins can assign user/verifier roles
3. **Permission inheritance**: Higher roles inherit permissions from lower roles
4. **Route protection**: Routes are protected at the router level
5. **Component security**: UI elements are hidden but not secured - always validate on the server

## Adding New Roles or Permissions

### 1. Add New Role

```javascript
// In constants/roles.js
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  VERIFIER: 'verifier',
  SUPER_ADMIN: 'super_admin',
  MODERATOR: 'moderator', // New role
}

// Add permissions for the new role
export const ROLE_PERMISSIONS = {
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.MODERATE_CONTENT, // New permission
  ],
}
```

### 2. Add New Permission

```javascript
// In constants/roles.js
export const PERMISSIONS = {
  // ... existing permissions
  MODERATE_CONTENT: 'moderate_content',
}

// Add to appropriate roles
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // ... existing permissions
    PERMISSIONS.MODERATE_CONTENT,
  ],
}
```

## Testing the Role System

Use the `RoleBasedExample.vue` component to test different role behaviors:

```vue
<template>
  <RoleBasedExample />
</template>

<script setup>
import RoleBasedExample from '@/components/RoleBasedExample.vue'
</script>
```

This component shows:

- Current user information
- Permission checks
- Role-specific content
- Available permissions

## Troubleshooting

### Common Issues

1. **User not getting correct role**: Check if profile was created with correct role during registration
2. **Permissions not working**: Ensure user profile is loaded and role is set correctly
3. **Navigation items not showing**: Check if permissions are correctly defined in the navigation items
4. **Route access denied**: Verify the route has the correct `roles` meta property

### Debug Commands

```javascript
// Check current user role
console.log('User role:', userStore.role)

// Check if user has specific permission
console.log('Can manage users:', userStore.hasPermission(PERMISSIONS.MANAGE_USERS))

// Check all permissions
console.log('All permissions:', userStore.permissions)

// Check if user is admin
console.log('Is admin:', userStore.isAdmin)
```

## Migration Guide

If you're updating an existing system:

1. **Update database**: Add role column to profiles table
2. **Set default roles**: Update existing users to have 'user' role
3. **Update components**: Add role-based rendering where needed
4. **Test thoroughly**: Verify all role-based functionality works correctly

This role-based access control system provides a robust foundation for managing user permissions and access levels in your application.
