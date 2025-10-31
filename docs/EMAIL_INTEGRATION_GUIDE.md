# 📧 Email Service Integration Guide

## Using SendGrid (Recommended)

---

## 🎯 **Why SendGrid?**

- ✅ Free tier: 100 emails/day (perfect for testing)
- ✅ Easy integration
- ✅ Reliable delivery
- ✅ Good documentation
- ✅ Template support

**Alternatives**: AWS SES, Mailgun, Resend (if preferred)

---

## 📋 **Step 1: Set Up SendGrid Account**

1. **Sign Up**: Go to https://sendgrid.com
2. **Verify Email**: Check your email and verify account
3. **Create API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it: `EcoLink Production` (or `EcoLink Development`)
   - Select "Full Access" permissions
   - Copy the API key (you'll only see it once!)

---

## 📋 **Step 2: Install SendGrid SDK**

```bash
npm install @sendgrid/mail
```

---

## 📋 **Step 3: Add Environment Variables**

### **Create/Update `.env` file:**

```env
# SendGrid Configuration
VITE_SENDGRID_API_KEY=SG.your_api_key_here
VITE_SENDGRID_FROM_EMAIL=noreply@ecolink.io
VITE_SENDGRID_FROM_NAME=EcoLink
```

### **For Production:**

- Add these to your hosting platform's environment variables
- **Never commit** `.env` file with real API keys to git!

---

## 📋 **Step 4: Update Email Service**

### **Current State** (`src/services/emailService.js`):

- Only console logging
- No real email sending

### **Implementation Plan**:

1. Import SendGrid SDK
2. Initialize with API key
3. Replace console.logs with real API calls
4. Add error handling
5. Test each email function

---

## 📋 **Step 5: Email Functions to Implement**

### **1. Welcome Email** ✅

- **When**: User registers
- **Template**: Welcome message
- **Data**: User name, email

### **2. Project Approved Email** ✅

- **When**: Verifier approves project
- **Template**: Approval notification
- **Data**: Project details, verifier notes

### **3. Project Rejected Email** ✅

- **When**: Verifier rejects project
- **Template**: Rejection notification
- **Data**: Project details, rejection reason, improvement suggestions

### **4. Credit Purchase Email** ✅

- **When**: User purchases credits
- **Template**: Purchase confirmation
- **Data**: Transaction details, certificate link

### **5. Email Verification** ✅

- **When**: User registers (if email verification enabled)
- **Template**: Verification link
- **Data**: Verification token

### **6. Password Reset Email** ✅

- **When**: User requests password reset
- **Template**: Reset link
- **Data**: Reset token

---

## 📋 **Step 6: Testing**

### **Test Each Email Type:**

1. **Welcome Email**:
   - Register new user
   - Check email inbox
   - Verify email received

2. **Project Approval**:
   - Submit project as developer
   - Approve as verifier
   - Check developer's email

3. **Purchase Confirmation**:
   - Purchase credits
   - Check email for receipt

### **Test in Development:**

- Use SendGrid's Activity Feed to see sent emails
- Check spam folder if emails don't arrive
- Verify email formatting looks good

---

## 🔒 **Security Best Practices**

1. **API Key Security**:
   - Store in environment variables only
   - Never commit to git
   - Use different keys for dev/prod

2. **Email Validation**:
   - Validate email addresses before sending
   - Handle bounces gracefully
   - Respect unsubscribe requests

3. **Rate Limiting**:
   - Don't send too many emails at once
   - Queue emails if needed
   - Monitor SendGrid dashboard

---

## 📊 **Expected Implementation Time**

- **Setup**: 30 minutes
- **Implementation**: 2-3 hours
- **Testing**: 1 hour
- **Total**: 1 day

---

## ✅ **Success Criteria**

- [ ] SendGrid account created
- [ ] API key added to environment
- [ ] SDK installed
- [ ] All email functions implemented
- [ ] Welcome email works
- [ ] Project approval email works
- [ ] Purchase confirmation email works
- [ ] No console.logs in production
- [ ] Error handling in place

---

_Ready to implement? Let's replace those console.logs with real emails!_

