# 🔐 Role-Based Access Analysis & Implementation Plan

## 📊 **Current System Analysis**

### **✅ What's Currently Implemented:**

#### **🏗️ Infrastructure:**

- ✅ Role-based authentication system
- ✅ Permission-based access control
- ✅ Route guards with role checking
- ✅ User store with role management
- ✅ Test accounts (admin, verifier, user)

#### **🎯 Current Routes & Views:**

- ✅ Dashboard (`/dashboard`)
- ✅ Projects Management (`/projects`)
- ✅ Marketplace (`/marketplace`)
- ✅ Wallet (`/wallet`)
- ✅ Admin Panel (`/admin`)
- ✅ Verifier Panel (`/verifier`)
- ✅ Analytics (`/analytics`)
- ✅ Certificates (`/certificates`)
- ✅ Receipts (`/receipts`)
- ✅ Buy Credits (`/buy-credits`)
- ✅ Sales Dashboard (`/sales`)
- ✅ Audit Logs (`/admin/audit-logs`)
- ✅ User Management (`/admin/users`)

---

## 🎯 **Role Requirements vs Current Implementation**

### **👤 GENERAL USERS**

#### **Required Functionalities:**

| Functionality              | Status         | Current Route                    | Notes                                 |
| -------------------------- | -------------- | -------------------------------- | ------------------------------------- |
| ✅ Sign up                 | ✅ Implemented | `/register`                      | Working                               |
| ✅ View credits            | ✅ Implemented | `/marketplace`                   | Working                               |
| ✅ Wallet                  | ✅ Implemented | `/wallet`                        | Working                               |
| ❌ Buy via GCash/Maya      | ❌ **MISSING** | `/buy-credits`                   | Only basic UI, no payment integration |
| ✅ View certificates       | ✅ Implemented | `/certificates`                  | Working                               |
| ✅ Transaction history     | ✅ Implemented | `/receipts`                      | Working                               |
| ✅ Market access           | ✅ Implemented | `/marketplace`                   | Working                               |
| ❌ Add project to buy/sell | ❌ **MISSING** | Need marketplace listing feature | Not implemented                       |
| ❌ Sales dashboard         | ❌ **MISSING** | `/sales`                         | Exists but needs user access          |
| ✅ Search projects         | ✅ Implemented | `/marketplace`                   | Working                               |
| ✅ Buy credits             | ⚠️ **PARTIAL** | `/buy-credits`                   | UI only, no payment processing        |
| ✅ Download receipts       | ✅ Implemented | `/receipts`                      | Working                               |

#### **Permission Updates Needed:**

```javascript
// Need to add these permissions to GENERAL_USER_PERMISSIONS:
PERMISSIONS.SEARCH_PROJECTS,
PERMISSIONS.BUY_CREDITS,
PERMISSIONS.DOWNLOAD_RECEIPTS,
PERMISSIONS.SALES_DASHBOARD, // For selling their own credits
PERMISSIONS.LIST_CREDITS_FOR_SALE, // New permission needed
```

---

### **👑 ADMIN**

#### **Required Functionalities:**

| Functionality                 | Status         | Current Route               | Notes   |
| ----------------------------- | -------------- | --------------------------- | ------- |
| ✅ Access all functionalities | ✅ Implemented | All routes                  | Working |
| ✅ Audit logs                 | ✅ Implemented | `/admin/audit-logs`         | Working |
| ✅ Approve users/projects     | ✅ Implemented | `/admin/users`, `/verifier` | Working |
| ✅ Generate reports           | ✅ Implemented | `/analytics`                | Working |

#### **Current Status:** ✅ **FULLY IMPLEMENTED**

---

### **✅ VERIFIERS**

#### **Required Functionalities:**

| Functionality              | Status         | Current Route            | Notes   |
| -------------------------- | -------------- | ------------------------ | ------- |
| ✅ Access all except admin | ✅ Implemented | Most routes              | Working |
| ✅ Access projects         | ✅ Implemented | `/projects`, `/verifier` | Working |
| ✅ Review projects         | ✅ Implemented | `/verifier`              | Working |
| ✅ Approve projects        | ✅ Implemented | `/verifier`              | Working |
| ✅ Upload reports          | ✅ Implemented | `/verifier`              | Working |

#### **Permission Updates Needed:**

```javascript
// Need to add general user permissions to verifiers:
...GENERAL_USER_PERMISSIONS, // All general user features
PERMISSIONS.ACCESS_PROJECTS,
PERMISSIONS.REVIEW_PROJECTS,
PERMISSIONS.APPROVE_PROJECTS,
PERMISSIONS.UPLOAD_REPORTS,
```

#### **Current Status:** ⚠️ **NEEDS GENERAL USER ACCESS**

---

## ❌ **Missing Functionalities**

### **🚨 Critical Missing Features:**

#### **1. GCash/Maya Payment Integration**

- **Status:** ❌ Not implemented
- **Required for:** General Users
- **Current:** Only basic buy credits UI
- **Need:** Real payment processing integration

#### **2. Marketplace Listing Feature**

- **Status:** ❌ Not implemented
- **Required for:** General Users to sell credits
- **Current:** Can only buy, not sell
- **Need:** "List Credits for Sale" functionality

#### **3. Enhanced Sales Dashboard**

- **Status:** ⚠️ Exists but limited access
- **Required for:** General Users (for their own sales)
- **Current:** Only for project developers
- **Need:** User-specific sales tracking

#### **4. Project Submission for General Users**

- **Status:** ⚠️ Limited to project developers
- **Required for:** General Users should be able to submit projects
- **Need:** Simplified project submission flow

---

## 🔧 **Implementation Plan**

### **Phase 1: Update Role Permissions** ⚡ _High Priority_

#### **Update `src/constants/roles.js`:**

```javascript
// Updated GENERAL_USER_PERMISSIONS
const GENERAL_USER_PERMISSIONS = [
  // Existing permissions
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.UPDATE_PROFILE,
  PERMISSIONS.SIGN_UP,
  PERMISSIONS.VIEW_CREDITS,
  PERMISSIONS.MANAGE_WALLET,
  PERMISSIONS.VIEW_CERTIFICATES,

  // NEW: Add missing permissions
  PERMISSIONS.SEARCH_PROJECTS,
  PERMISSIONS.BUY_CREDITS,
  PERMISSIONS.DOWNLOAD_RECEIPTS,
  PERMISSIONS.SALES_DASHBOARD, // For their own sales
  PERMISSIONS.BUY_VIA_GCASH_MAYA, // New permission
  PERMISSIONS.LIST_CREDITS_FOR_SALE, // New permission
  PERMISSIONS.SUBMIT_PROJECTS, // Allow project submission
]

// Updated VERIFIER_PERMISSIONS
const VERIFIER_PERMISSIONS = [
  // Include ALL general user permissions
  ...GENERAL_USER_PERMISSIONS,

  // Verifier-specific permissions
  PERMISSIONS.ACCESS_PROJECTS,
  PERMISSIONS.REVIEW_PROJECTS,
  PERMISSIONS.APPROVE_PROJECTS,
  PERMISSIONS.UPLOAD_REPORTS,
]
```

### **Phase 2: Add Missing Payment Integration** 💳 _High Priority_

#### **Create GCash/Maya Payment Service:**

```javascript
// src/services/paymentService.js
export class PaymentService {
  async processGCashPayment(amount, credits) {
    /* Implementation */
  }
  async processMayaPayment(amount, credits) {
    /* Implementation */
  }
  async verifyPayment(transactionId) {
    /* Implementation */
  }
}
```

#### **Update Buy Credits View:**

- Add GCash/Maya payment options
- Integrate with payment APIs
- Add payment confirmation flow

### **Phase 3: Add Marketplace Listing Feature** 🏪 _Medium Priority_

#### **Create Credit Listing Components:**

```javascript
// src/components/marketplace/ListCreditsModal.vue
// src/components/marketplace/UserListings.vue
// src/services/marketplaceService.js
```

#### **Update Database Schema:**

```sql
-- Add user_credit_listings table
CREATE TABLE user_credit_listings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  credits_amount INTEGER,
  price_per_credit DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Phase 4: Enhanced User Sales Dashboard** 📊 _Medium Priority_

#### **Create User-Specific Sales View:**

```javascript
// src/views/UserSalesView.vue - For general users
// Different from existing SalesView (for project developers)
```

### **Phase 5: Route Access Updates** 🛣️ _Low Priority_

#### **Update Route Guards:**

```javascript
// Update src/router/index.js with new permission requirements
{
  path: '/sales',
  name: 'user-sales',
  component: UserSalesView,
  meta: { requiresAuth: true, permissions: [PERMISSIONS.SALES_DASHBOARD] }
}
```

---

## 📋 **Updated Role Access Matrix**

### **👤 General Users - UPDATED ACCESS:**

```
✅ Homepage & Marketplace (search, filter, buy)
✅ Wallet Management (view balance, transactions)
✅ Certificates (view, download)
✅ Receipts (view, download)
✅ Buy Credits (with GCash/Maya) ← NEW
✅ List Credits for Sale ← NEW
✅ Personal Sales Dashboard ← NEW
✅ Submit Projects (simplified) ← NEW
✅ Profile & Settings
```

### **✅ Verifiers - UPDATED ACCESS:**

```
✅ All General User Features ← NEW
✅ Verifier Panel (review, approve projects)
✅ Upload Reports
✅ Project Management
❌ Admin-only features (user management, system settings)
```

### **👑 Admins - CURRENT ACCESS:**

```
✅ Everything (no changes needed)
✅ User Management
✅ System Settings
✅ Audit Logs
✅ Analytics & Reports
✅ Database Management
```

---

## 🚀 **Next Steps**

1. **Update role permissions** in `src/constants/roles.js`
2. **Implement GCash/Maya payment integration**
3. **Add marketplace listing functionality**
4. **Create user-specific sales dashboard**
5. **Test all role-based access scenarios**

---

## 🧪 **Testing Strategy**

### **Test with your 3 accounts:**

- **admin@ecolink.test** - Should access everything
- **verifier@ecolink.test** - Should access all user features + verifier tools
- **user@ecolink.test** - Should access all general user features

### **Test Scenarios:**

1. Login as each role
2. Navigate to each route
3. Verify appropriate access/restrictions
4. Test payment flows (when implemented)
5. Test marketplace listing (when implemented)

---

_This analysis shows your system has a solid foundation but needs payment integration and enhanced user marketplace features to fully meet the requirements._
