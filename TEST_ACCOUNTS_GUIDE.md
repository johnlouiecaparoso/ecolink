# Test Accounts Guide

## 🎯 **Complete Set of Test Accounts**

You now have all 4 role types available for testing:

### **1. Admin Account** 👑

- **Email**: `admin@ecolink.test`
- **Password**: `admin123`
- **Role**: Administrator
- **Access**: Full system access, project approval, user management
- **Features**: Can approve/reject projects, manage users, view analytics

### **2. Verifier Account** ✅

- **Email**: `verifier@ecolink.test`
- **Password**: `verifier123`
- **Role**: Verifier
- **Access**: Project verification, review projects
- **Features**: Can review and verify projects, assign to verifiers

### **3. Project Developer Account** 🌱

- **Email**: `developer@ecolink.test`
- **Password**: `developer123`
- **Role**: Project Developer
- **Access**: Create and manage projects
- **Features**: Can create projects, view own projects, submit for approval

### **4. General User Account** 👤

- **Email**: `user@ecolink.test`
- **Password**: `user123`
- **Role**: General User
- **Access**: Basic user features
- **Features**: Can browse marketplace, purchase credits, view portfolio

## 🚀 **How to Use These Accounts**

### **Step 1: Login to Your Application**

1. Go to `http://localhost:5173`
2. Click "Login"
3. Use any of the test account credentials above

### **Step 2: Test Different Workflows**

#### **As Project Developer** (`developer@ecolink.test`):

1. **Create a new project**:
   - Go to "Create Project" or "Submit Project"
   - Fill in project details (title, description, category, location, expected impact)
   - Submit for approval
2. **View your projects**:
   - Check "My Projects" section
   - See project status (pending, approved, rejected)

#### **As Admin** (`admin@ecolink.test`):

1. **Go to admin panel**: `http://localhost:5173/admin`
2. **Review pending projects**:
   - See all projects submitted by developers
   - Click "Approve" or "Reject" buttons
3. **Check marketplace**:
   - Approved projects should appear in marketplace
   - Credits should be available for purchase

#### **As Verifier** (`verifier@ecolink.test`):

1. **Review projects**:
   - Access verifier interface
   - Review project details
   - Provide verification feedback

#### **As General User** (`user@ecolink.test`):

1. **Browse marketplace**:
   - View available carbon credits
   - See project details
2. **Purchase credits**:
   - Buy carbon credits from approved projects
   - View your portfolio

## 🔄 **Complete Testing Workflow**

### **1. Create Project (as Developer)**

```
Login: developer@ecolink.test / developer123
→ Create Project
→ Fill in details
→ Submit for approval
```

### **2. Approve Project (as Admin)**

```
Login: admin@ecolink.test / admin123
→ Go to /admin
→ Review pending projects
→ Click "Approve Project"
```

### **3. Purchase Credits (as User)**

```
Login: user@ecolink.test / user123
→ Go to Marketplace
→ Browse available credits
→ Purchase credits
```

### **4. Verify Project (as Verifier)**

```
Login: verifier@ecolink.test / verifier123
→ Access verifier interface
→ Review project details
→ Provide verification notes
```

## 📋 **Account Permissions Summary**

| Role                  | Create Projects | Approve Projects | Purchase Credits | Admin Access | Verifier Access |
| --------------------- | --------------- | ---------------- | ---------------- | ------------ | --------------- |
| **Admin**             | ✅              | ✅               | ✅               | ✅           | ✅              |
| **Verifier**          | ❌              | ✅               | ✅               | ❌           | ✅              |
| **Project Developer** | ✅              | ❌               | ✅               | ❌           | ❌              |
| **General User**      | ❌              | ❌               | ✅               | ❌           | ❌              |

## 🎯 **Quick Test Scenarios**

### **Scenario 1: Project Submission & Approval**

1. Login as **Project Developer** → Create project → Submit
2. Login as **Admin** → Go to `/admin` → Approve project
3. Login as **User** → Go to marketplace → See credits available

### **Scenario 2: Credit Purchase**

1. Login as **User** → Browse marketplace → Purchase credits
2. Check portfolio → View purchased credits

### **Scenario 3: Project Verification**

1. Login as **Verifier** → Review projects → Add verification notes
2. Login as **Admin** → See verification status

## 🚨 **Important Notes**

- **All accounts are test accounts** - Use only for development/testing
- **Passwords are simple** - Change them for production use
- **Roles are pre-configured** - No need to manually set roles
- **Database integration** - All accounts work with your Supabase database

## 🎉 **Ready to Test!**

You now have all 4 role types available for comprehensive testing of your EcoLink application. Each account has the appropriate permissions and access levels for their role! 🚀

