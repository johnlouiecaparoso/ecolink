# Admin Guide: Project Approval Interface

## 🎯 **How to Access the Admin Interface**

As an admin, you can access the project approval interface through the following steps:

### **Step 1: Login as Admin**

1. Go to your application: `http://localhost:5173`
2. Click "Login"
3. Use admin credentials (you'll need to create an admin account first)

### **Step 2: Navigate to Admin Panel**

1. Once logged in as admin, you'll see the admin interface
2. Go to: `http://localhost:5173/admin`
3. You'll see the **Admin Dashboard** with:
   - Total Users
   - Active Projects
   - Pending Projects
   - Total Credits

### **Step 3: Project Approval Section**

In the admin dashboard, you'll find the **"Project Approval"** section which includes:

## 📋 **Project Approval Features**

### **What You Can See:**

- ✅ **All pending projects** submitted by project developers
- ✅ **Project details** including:
  - Project title and category
  - Location and submission date
  - Expected impact description
  - Full project description
  - Developer information

### **What You Can Do:**

- ✅ **Approve projects** - Click "✅ Approve Project" button
- ✅ **Reject projects** - Click "❌ Reject Project" button (with reason)
- ✅ **View project details** - Full project information
- ✅ **Track approval status** - See which projects are processed

## 🚀 **Project Approval Workflow**

### **When You Approve a Project:**

1. **Project status changes** from "pending" to "approved"
2. **Credits are automatically generated** based on project category:
   - Forestry: 1000 credits
   - Renewable Energy: 500 credits
   - Blue Carbon: 800 credits
   - Energy Efficiency: 300 credits
   - Waste Management: 400 credits
3. **Project appears in marketplace** for buyers to purchase credits
4. **Developer gets notified** of approval

### **When You Reject a Project:**

1. **Project status changes** to "rejected"
2. **Reason is recorded** for the developer
3. **Developer gets notified** of rejection with feedback

## 🔧 **Admin Interface Components**

### **Main Admin Dashboard** (`/admin`)

- Overview statistics
- Project approval panel
- System management tools

### **Project Approval Panel**

- List of all pending projects
- Approve/Reject buttons
- Project details view
- Processing status indicators

### **Additional Admin Features**

- **User Management** (`/admin/users`) - Manage user accounts
- **Database Management** (`/admin/database`) - Database operations
- **Audit Logs** (`/admin/audit-logs`) - System activity logs

## 🎯 **Quick Start Steps**

1. **Start your application:**

   ```bash
   npm run dev
   ```

2. **Create an admin account:**
   - Register a new user
   - Update their role to "admin" in the database
   - Or use the test accounts if available

3. **Access admin interface:**
   - Go to `http://localhost:5173/admin`
   - You should see the project approval panel

4. **Test the workflow:**
   - Create a test project as a project developer
   - Switch to admin view
   - Approve the project
   - Check marketplace to see the credits

## 📊 **Expected Results**

After approving a project:

- ✅ **Project status**: Changes to "approved"
- ✅ **Credits generated**: Based on project category
- ✅ **Marketplace listing**: Project credits appear for sale
- ✅ **Developer notification**: Email sent about approval
- ✅ **Admin dashboard**: Updated statistics

## 🚨 **Troubleshooting**

If you don't see the admin interface:

1. **Check your role** - Make sure you're logged in as admin
2. **Check permissions** - Admin role should have access to `/admin` routes
3. **Check console** - Look for any JavaScript errors
4. **Check database** - Ensure projects exist with "pending" status

The admin interface is fully functional and ready to use! 🎉

