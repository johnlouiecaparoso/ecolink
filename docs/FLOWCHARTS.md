# EcoLink Flowcharts

## 1. User Authentication Flow

```
┌─────────────┐
│   User      │
│  Visits App │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Is Session      │
│  Valid?         │
└──┬──────────┬───┘
   │ YES      │ NO
   │          │
   ▼          ▼
┌─────────┐ ┌──────────────┐
│ Fetch   │ │ Redirect to │
│ Profile │ │  Login Page │
└────┬────┘ └──────┬───────┘
     │             │
     │             ▼
     │      ┌──────────────┐
     │      │ User Enters  │
     │      │ Credentials  │
     │      └──────┬───────┘
     │             │
     │             ▼
     │      ┌──────────────┐
     │      │ Validate &  │
     │      │ Authenticate│
     │      └──────┬───────┘
     │             │
     │             ▼
     │      ┌──────────────┐
     │      │ Fetch User  │
     │      │ Profile     │
     │      └──────┬───────┘
     │             │
     │             ▼
     └─────────────┘
            │
            ▼
┌───────────────────────┐
│ Determine User Role   │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ Redirect to Role-      │
│ Based Dashboard       │
│                       │
│ Admin → /admin        │
│ Developer → /submit-  │
│   project             │
│ User → /marketplace   │
└───────────────────────┘
```

## 2. Project Submission Flow

```
┌──────────────────┐
│ Project Developer│
│  Logs In         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Accesses Submit  │
│ Project Page     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Fills Project    │
│ Form             │
│ - Title          │
│ - Description    │
│ - Category       │
│ - Location       │
│ - Impact         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Submits Form     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Validate Data   │
└──┬───────────┬──┘
   │ Valid     │ Invalid
   │           │
   ▼           ▼
┌─────────┐  ┌──────────┐
│ Save to │  │ Show     │
│ Database│  │ Errors   │
│ Status: │  └──────────┘
│ pending │       │
└────┬────┘       │
     │           │
     │           └──┐
     │              │
     ▼              │
┌──────────────────┐│
│ Notify Verifier  ││
│ (if applicable)  ││
└────┬─────────────┘│
     │              │
     ▼              │
┌──────────────────┐│
│ Project Added    ││
│ Awaiting Review  ││
└──────────────────┘│
                    │
                    └──┐
                       │
                       ▼
            ┌──────────────────┐
            │ User Fixes Errors │
            │ & Resubmits      │
            └──────────────────┘
```

## 3. Credit Purchase Flow

```
┌──────────────────┐
│   Buyer/User     │
│  Browses         │
│  Marketplace     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Selects Credit   │
│ Listing         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Views Details   │
│ - Price          │
│ - Quantity       │
│ - Project Info   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Click "Buy"     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check Wallet    │
│ Balance?        │
└──┬───────────┬──┘
   │ Sufficient│ Insufficient
   │           │
   ▼           ▼
┌─────────┐  ┌──────────────┐
│ Proceed │  │ Top Up       │
│ to      │  │ Wallet First │
│ Payment │  └──────┬───────┘
└────┬────┘        │
     │             │
     │             └──┐
     │                │
     ▼                │
┌──────────────────┐  │
│ Select Payment   │  │
│ Method           │  │
│ - GCash          │  │
│ - Maya           │  │
│ - Wallet Balance │  │
└────────┬─────────┘  │
         │            │
         ▼            │
┌──────────────────┐  │
│ Process Payment  │  │
└──┬───────────┬───┘  │
   │ Success   │ Fail │
   │           │      │
   ▼           ▼      │
┌─────────┐  ┌──────┐│
│ Update  │  │ Show ││
│ Credit  │  │Error ││
│ Ownership│  └──────┘│
│         │          │
│ Generate│          │
│Receipt  │          │
│         │          │
│ Issue   │          │
│Certificate│        │
└─────────┘          │
                     │
                     └──┐
                        │
                        ▼
                ┌──────────────┐
                │ Return to    │
                │ Purchase     │
                └──────────────┘
```

## 4. Project Approval Flow (Admin/Verifier)

```
┌──────────────────┐
│ Admin/Verifier   │
│  Logs In         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Accesses Admin   │
│ Dashboard        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Views Pending    │
│ Projects List    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Selects Project │
│ to Review       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Reviews Details │
│ - Project Info   │
│ - Documentation  │
│ - Impact         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Makes Decision   │
└──┬───────────┬───┘
   │ Approve   │ Reject
   │           │
   ▼           ▼
┌─────────┐  ┌──────────┐
│ Set     │  │ Set      │
│ Status: │  │ Status:  │
│approved │  │rejected  │
└────┬────┘  └─────┬────┘
     │             │
     ▼             │
┌─────────────┐    │
│ Generate    │    │
│ Credits     │    │
│             │    │
│ Create      │    │
│ project_    │    │
│ credits     │    │
│ Record      │    │
└─────┬───────┘    │
      │            │
      ▼            │
┌─────────────┐    │
│ Notify      │    │
│ Developer   │    │
│             │    │
│ Email + UI  │    │
│ Notification│    │
└─────────────┘    │
                   │
                   ▼
            ┌─────────────┐
            │ Notify      │
            │ Developer   │
            │             │
            │ Explain     │
            │ Rejection   │
            └─────────────┘
```

## 5. Wallet Transaction Flow

```
┌──────────────────┐
│   User           │
│  Opens Wallet    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Views Balance &  │
│ Transaction      │
│ History          │
└──┬───────────┬───┘
   │           │
   │ Top Up    │ Withdraw
   │           │
   ▼           ▼
┌─────────┐  ┌──────────┐
│ Enter   │  │ Enter    │
│ Amount  │  │ Amount   │
│         │  │          │
│ Select  │  │ Confirm  │
│ Payment │  │ Withdraw │
│ Method  │  │          │
└────┬────┘  └─────┬────┘
     │             │
     ▼             ▼
┌─────────────┐  ┌──────────────┐
│ Process     │  │ Check        │
│ Payment     │  │ Sufficient   │
│ (GCash/     │  │ Balance      │
│  Maya)      │  └──┬────────┬──┘
└─────┬───────┘     │ Yes   │ No
      │             │       │
      ▼             ▼       ▼
┌─────────────┐  ┌──────┐ ┌──────┐
│ Receive     │  │Create│ │Show  │
│ Payment     │  │Trans.│ │Error │
│ Confirmation│  └───┬───┘ └──────┘
│             │      │
└──────┬──────┘      │
       │             │
       ▼             ▼
┌─────────────┐  ┌──────────────┐
│ Update      │  │ Update       │
│ Wallet      │  │ Wallet       │
│ Balance     │  │ Balance      │
│ (+amount)   │  │ (-amount)   │
│             │  │              │
│ Record      │  │ Record       │
│ Transaction │  │ Transaction  │
└─────────────┘  └──────────────┘
```

## 6. Role-Based Access Control Flow

```
┌──────────────────┐
│   User Request   │
│   Protected      │
│   Route          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Router Guard     │
│ Checks Auth      │
└──┬───────────┬───┘
   │Logged In  │Not Logged In
   │           │
   ▼           ▼
┌─────────┐  ┌──────────────┐
│ Continue│  │ Redirect to │
│         │  │ Login Page  │
└────┬────┘  └──────────────┘
     │
     ▼
┌──────────────────┐
│ Check Route      │
│ Meta Requirements│
└──┬───────────┬───┘
   │Requires   │No Special
   │Role?      │Role
   │           │
   ▼           ▼
┌─────────┐  ┌──────────┐
│ Role    │  │ Allow    │
│ Guard   │  │ Access   │
└────┬────┘  └──────────┘
     │
     ▼
┌──────────────────┐
│ Check User Role  │
│ Against Required │
│ Permission       │
└──┬───────────┬───┘
   │Has Access │No Access
   │           │
   ▼           ▼
┌─────────┐  ┌──────────────┐
│ Allow   │  │ Redirect to │
│ Access  │  │ Role-Based  │
│         │  │ Dashboard   │
└─────────┘  └──────────────┘
```

## 7. Data Synchronization Flow (Refresh)

```
┌──────────────────┐
│   Page Refresh   │
│   or Navigation   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Router Guard     │
│ Activated        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check User Store │
│ Has Session?     │
└──┬───────────┬───┘
   │ Has       │ No
   │ Session   │
   │           │
   ▼           ▼
┌─────────┐  ┌──────────────────┐
│ Use     │  │ Check Supabase   │
│ Store   │  │ localStorage     │
│ Session │  │ for Session       │
└────┬────┘  └──┬────────────┬───┘
     │          │ Found     │ Not Found
     │          │           │
     ▼          ▼           ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│ Fetch   │  │ Restore │  │ Redirect │
│ Profile │  │ Session │  │ to Login │
│         │  │ & Fetch │  │          │
│ Update  │  │ Profile │  │          │
│ Store   │  └────┬────┘  └──────────┘
└─────────┘      │
                 │
                 ▼
          ┌──────────────┐
          │ Update Store │
          │ & Allow      │
          │ Navigation   │
          └──────────────┘
```




