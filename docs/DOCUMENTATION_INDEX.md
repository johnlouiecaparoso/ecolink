# EcoLink System Documentation Index

This directory contains comprehensive documentation diagrams for the EcoLink carbon credit marketplace platform.

## Documentation Files

### 1. System Architecture (`SYSTEM_ARCHITECTURE.md`)

- Technology stack overview
- Layer architecture
- Service descriptions
- Security architecture
- Data flow patterns

### 2. Flowcharts (`FLOWCHARTS.md`)

- User authentication flow
- Project submission flow
- Credit purchase flow
- Project approval flow
- Wallet transaction flow
- Role-based access control flow
- Data synchronization flow (refresh)

### 3. Use Case Diagram (`USE_CASE_DIAGRAM.md`)

- System actors (User, Developer, Verifier, Admin)
- Use cases by actor
- Use case relationships
- Detailed use case descriptions

### 4. Data Flow Diagram (`DATA_FLOW_DIAGRAM.md`)

- Level 0: Context diagram
- Level 1: System data flow
- Data store definitions
- Process descriptions

### 5. Conceptual Framework (`CONCEPTUAL_FRAMEWORK.md`)

- Core concepts
- Business logic flow
- System principles
- Domain model relationships
- Key business rules

### 6. Entity Relationship Diagram (`ENTITY_RELATIONSHIP_DIAGRAM.md`)

- Complete ERD
- Entity descriptions
- Relationship cardinalities
- Key constraints
- Data integrity rules

## Quick Reference

### Technology Stack

- **Frontend**: Vue.js 3, Vue Router, Pinia, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payment**: GCash, Maya integration

### Main Entities

1. Users/Profiles
2. Projects
3. Project Credits
4. Credit Listings
5. Credit Purchases
6. Credit Ownership
7. Certificates
8. Wallet Accounts & Transactions

### User Roles

1. **General User**: Buy credits, manage wallet
2. **Project Developer**: Submit projects
3. **Verifier**: Review and approve projects
4. **Buyer/Investor**: Purchase credits
5. **Administrator**: Full system access

### Key Workflows

1. User Registration → Authentication → Role-based Dashboard
2. Project Submission → Verification → Approval → Credit Generation
3. Credit Listing → Purchase → Payment → Ownership Transfer → Certificate
4. Wallet Management → Top-up → Purchase → Transactions

## How to Use These Diagrams

### For Development

- Use **System Architecture** to understand tech stack
- Use **ERD** for database operations
- Use **Data Flow Diagram** for service integration

### For Business Analysis

- Use **Use Case Diagram** for feature requirements
- Use **Flowcharts** for process understanding
- Use **Conceptual Framework** for business logic

### For Testing

- Use **Flowcharts** to create test scenarios
- Use **Use Cases** for test case development
- Use **Data Flow** to test integrations

## Related Files

- `ROLE_ACCESS_SUMMARY.md` - Role permissions
- `DATABASE_SETUP.md` - Database setup guide
- `README.md` - Project overview




