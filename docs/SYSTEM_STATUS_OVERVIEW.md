# Ecolink — System Status Overview (Implemented vs. Not Implemented)

> **What this is:** A single, plain-language summary of **everything that is built** and **everything that is not yet built** in Ecolink, compiled from all the analysis docs in this folder.
> **Compiled:** 2026-06-06
> **Sources:** `ECOLINK_SYSTEM_ANALYSIS.md`, `IMPLEMENTATION_TASKLIST.md`, `CARBONIFY_BOARD_UPDATED.md`, `SYSTEM_GUIDE.md`, `PAYMENTS_ARCHITECTURE.md`, `REAL_WORLD_GOLIVE_PLAYBOOK.md`, `VENDOR_SCORECARD_AND_TECH_DESIGN.md`, `CONSOLE_ERRORS_AFTER_PAYMENT.md`

**Legend:** ✅ Implemented · 🟡 Partial (started but incomplete) · ❌ Not implemented · ⏳ Future / institutional (beyond software alone)

---

## 1. The One-Paragraph Summary

Ecolink is a **Vue 3 + Supabase** carbon-credit registry and marketplace. The **core product is built and works end-to-end**: users register, projects get submitted and verified, credits are issued with tamper-evident certificates, and buyers can purchase them through a real payment gateway. The system has **6 user roles, MFA, KYC, a full MRV module, and LGU climate tools** — it has done and *exceeded* the original 14-week MVP plan. **What is NOT done is mostly "production money safety" and "institutional/legal" work**: payments still run amounts client-side (a real-money blocker), sellers cannot cash out, there's no mobile app, and the credits are simulated rather than tied to a real registry (Verra/Gold Standard).

| How it's measured | Score | Meaning |
|---|---|---|
| As a capstone vs. its own requirements (SRD) | **9.0 / 10** | Nearly feature-complete |
| As a Philippine-eligible platform | **8.5 / 10** | 7 of 8 target areas delivered |
| As a real production registry (Verra-class) | **4.5 / 10** | Has the *shape*, lacks accreditation + real money safety |

---

## 2. ✅ WHAT IS IMPLEMENTED (working today)

### Authentication & Security — ✅ Strong (9.5/10)
- ✅ Email/password sign-up, login, sessions, logout (Supabase Auth, bcrypt)
- ✅ Role-based access control — **6 roles** (general_user, buyer_investor, project_developer, verifier, admin, LGU), route guards, RLS
- ✅ Password reset (forgot/reset email flow)
- ✅ **TOTP 2FA/MFA** with strict login enforcement (aal2 step-up)
- ✅ **KYC** — application form, admin review/approval, purchase gate
- ✅ Organization profiles (name/type/address)
- ✅ Audit logging across auth, projects, MRV, KYC, payments, roles

### Projects & Registration — ✅ Strong (8.5/10)
- ✅ Project submission form (title, geo-coordinates, barangay, municipality, type, dates, host entity)
- ✅ **7 predefined PH project types** (DENR/CCC-aligned, DB-enforced)
- ✅ **9 document upload types** (PDD, baseline, additionality, leakage, safeguards, feasibility, LGU endorsement, land ownership, ECC, MOA)
- ✅ Validation workflow + statuses (Draft → Submitted → In Review → Needs Revision → Validated → Rejected)
- ✅ Project progress tracker (Registration → Validation → Verification → Issuance → Trading)
- ✅ Risk/feasibility scoring (shown as marketplace badges)
- ✅ Role application workflow (apply for developer/verifier; reviewers notified)

### MRV (Monitoring, Reporting, Verification) — ✅ Strong (9.0/10)
- ✅ Monitoring reports (period, activity data, photo/log evidence)
- ✅ **Server-side emission-reduction calculation** (RPC + methodology factors — client cannot dictate credit amounts)
- ✅ Verifier MRV review dashboard + VER approval
- ✅ Credits mint **only** on verifier approval (decoupled issuance via DB trigger)
- ✅ Time-stamped audit trail

### Issuance & Certificates — ✅ Strong (9.5/10)
- ✅ Certificate generation with **per-unit carbon serial numbers** (`ECO-…`)
- ✅ **QR code + SHA-256 tamper-evident digital signature**
- ✅ **Public certificate verification page** (no login needed)
- ✅ PDF certificate download

### Trading & Marketplace — 🟡 Mostly done (7.5/10)
- ✅ Browse marketplace, filter by **location/price/category**, interactive **Leaflet map**
- ✅ Purchase via **PayMongo** (GCash/Maya/cards), ownership transfer, transaction IDs, balance update
- ✅ Listings auto-created on issuance
- ✅ Wallet, top-up, receipts, portfolio
- ✅ **Retirement + atomic anti-double-counting** + retirement certificate

### Analytics, Notifications, LGU, UX
- ✅ Carbon calculator (PH emission factors)
- ✅ Dashboards (admin, developer, platform overview) + Chart.js charts
- ✅ Email + in-app dashboard notifications (DB triggers)
- ✅ **LGU tools** — MSW emissions calculator, waste-diversion monitoring, city ESG summary, host endorsements
- ✅ Onboarding guide; role-organized navigation

### Tech foundation
- ✅ Web app deployable (Vite build, Vercel-ready)
- ✅ Supabase Edge Functions: `paymongo-checkout`, `paymongo-webhook`, `send-approval-email`
- ✅ Test harness configured (Vitest, MSW, Playwright)

---

## 3. ❌ WHAT IS NOT IMPLEMENTED (the gap list)

### 🔴 A. Money Safety — the #1 production blocker
*Today money logic runs in the browser. This must move server-side before handling real money.*
- ❌ Server-side payment amounts (currently set client-side — **unsafe for real money**)
- ❌ Signed webhook as the source of truth (verify + idempotent)
- ❌ Double-entry ledger + idempotency keys
- ❌ Reconciliation job (ledger vs. provider settlement)
- ❌ Escrow hold/release for marketplace trades
- ❌ Partner-custodied wallet (licensed PSP/EMI holds the funds)
- 🟡 Oversell hardening — consolidate the dual `available_credits`/`credits_available` columns into a race-safe atomic decrement

### 🔴 B. Sellers Cannot Get Paid
*Developers can earn credits but cannot cash out — blocks Ecolink from being a real marketplace.*
- ❌ Seller payouts / disbursement (developer KYB + hold periods + payout history)
- 🟡 **Withdraw** — UI exists (`Withdraw.vue`) but no backend
- ❌ Seller KYB (business verification)
- 🟡 Seller sales/earnings dashboard (transactions recorded, but `SalesView.vue` is hidden — no UI)
- ❌ Listing price-edit / pause-relist / inventory management
- ❌ Admin finance console (transactions, revenue, payouts, refunds, reconciliation)

### 🔴 C. Real, Trustworthy Credits
*Credits are currently simulated, not tied to a recognized registry.*
- ❌ Credit-supplier API integration (real Verra/Gold Standard credits + retirement) — "Track A"
- ❌ Provider abstraction layer (`CreditSupplier` + `PaymentProvider` interfaces + mocks)
- 🟡 Full project detail page (documents, methodology, map, vintage, co-benefits) for buyer due diligence
- ❌ ESG / offset report export (PDF/CSV) for buyer disclosure
- ❌ SDG impact data capture + real marketplace filter (current SDG filter is cosmetic)

### 🟠 D. Developer ↔ Verifier Workflow Completeness
- ❌ Edit & resubmit after "needs revision"
- ❌ Two-way comment / request thread (developer ↔ verifier)
- ❌ Validation checklist / scored rubric
- ❌ Adjustable VERs before approval (verifier calculation transparency)
- ❌ Verifier task queue — assignment, filters, aging/SLA
- ❌ Evidence integrity checks (EXIF geotag/timestamp, duplicate detection)
- ❌ **MRV reminders** (scheduled email + dashboard nudges)
- ❌ Methodology selection/reference
- ❌ Project boundary (map polygon) — currently captured only narratively
- 🟡 Financials persisted + displayed + projection upload (form fields exist, not surfaced)
- ❌ Document re-upload / versioning

### 🔴/🟠 E. Admin & Compliance
- ❌ System config UI (emission factors, fees, KYC tiers, project types — currently hardcoded in migrations)
- ❌ Regulatory & business reports + **CSV/PDF export** (analytics are on-screen only)
- ❌ AML screening/monitoring
- ❌ **Data Privacy Act (DPA) tooling** — consent, data export, delete
- ❌ User lifecycle (suspend/ban/reactivate, impersonation, bulk ops)
- ❌ Fraud/risk dashboard + anomaly alerts
- ❌ Dispute-resolution console
- ❌ Audit log search/filter/export
- ❌ Broadcast announcements / feature flags / maintenance mode

### 🟠/🟢 F. Buyer Experience
- ❌ Cart / multi-item checkout + RFQ / bulk quote
- ❌ Tax-compliant invoices / BIR official receipt (with VAT)
- ❌ Refund / dispute flow
- 🟡 Shareable retirement/claim page + badge (verify page exists)
- ❌ Watchlist + price/new-listing alerts
- ❌ Recurring / auto-offset subscription
- ❌ Price history / comparison
- ❌ One-click calculator → checkout

### 🟠/🟢 G. LGU Tools
- ❌ City ESG report export (PDF/CSV)
- ❌ LGU community-project tracker
- ❌ Trend charts (emissions/diversion over time)
- ❌ Evidence upload to LGU records
- ❌ Land-use carbon modeling
- ❌ Benchmarking vs. other LGUs

### 🟠/🟢 H. Platform, Transparency & Ops
- ❌ **Public searchable registry** (all projects/credits/retirements) — biggest single trust signal
- ❌ DR runbook, backups/PITR, restore tests, performance-NFR validation
- ❌ Published methodology documentation (cited emission-factor sources)
- ❌ Docker / containerization

### 📱 I. Mobile — Not Started
- ❌ Mobile app (original plan: React Native; recommended pivot: responsive **PWA** from existing Vue SPA)
- ❌ Mobile login / wallet / marketplace / certificate viewer
- ❌ Push notifications

### ⏳ J. Future / Institutional (beyond software alone)
- ⏳ Blockchain tokenization / immutable registry
- ⏳ Article 6 / national-registry interoperability (API)
- ⏳ Accredited third-party VVB model (currently an internal verifier role)
- ⏳ Approved, peer-reviewed methodologies (currently simplified IPCC-style factors)
- ⏳ Independent governance / ICVCM Core Carbon Principles labeling
- ⏳ Double-claim / double-use prevention registry

---

## 4. Status at a Glance — by Module

| Module | Status | Score | What's missing |
|---|---|---|---|
| User Management & Security | ✅ | 9.5 | Nothing major |
| Project Registry | ✅ | 8.5 | Structured boundary, financials module |
| MRV system | ✅ | 9.0 | Simplified (not accredited) methodologies |
| Issuance & Certificates | ✅ | 9.5 | Nothing major |
| Verifier Panel | ✅ | 8.5 | Task queue, adjustable VERs, comment thread |
| Admin Panel | ✅ | 8.0 | AML, config UI, CSV export |
| Marketplace | 🟡 | 7.5 | Seller payouts, offers/bidding, seller dashboard |
| **Wallet & Finance** | 🟡 | **6.0** | **Server-side amounts, ledger, payouts, withdraw** |
| Analytics & Reports | 🟡 | 8.0 | Exportable reports |
| LGU tools | ✅ | 8.5 | Exports, land-use modeling, benchmarking |
| **Mobile** | ❌ | **0** | **Entire mobile/PWA app** |
| Regulatory readiness | 🟡 | 4.0 | Accreditation, methodologies, national-registry link |

---

## 5. Status at a Glance — by User Role

| Role | ✅ Can do today | ❌ Still missing |
|---|---|---|
| **Buyer / Investor** | Sign up, 2FA, KYC, browse, map, calculator, buy (PayMongo), wallet, receipts, certificates, retire | Real registry credits, full project detail page, ESG report export, BIR invoice, cart/bulk, refunds, watchlist, SDG filter |
| **Project Developer** | Submit projects, track status, MRV reporting, credit issuance via VER | **Cash-out/payout**, seller KYB, sales dashboard UI, price/inventory mgmt, edit/resubmit, comment thread |
| **Verifier** | Access projects, review, approve (mints credits), upload reports, review role applications | Task queue/SLA, adjustable VERs, validation checklist, evidence integrity checks |
| **Admin** | Audit logs, approve users/projects/KYC/roles, dashboard analytics | AML/fraud tools, system-config UI, report export, user lifecycle, finance console |
| **LGU User** | Emissions calculator, waste-diversion tracking, city ESG, project endorsements | ESG export, benchmarking, trend charts, land-use modeling |

---

## 6. Known Bugs / Cleanup (from `CONSOLE_ERRORS_AFTER_PAYMENT.md`)

| Issue | User impact | Fix |
|---|---|---|
| 🔴 `credit_ownership` missing `updated_at` | **Credits not added to portfolio after payment** | Run migration `20260215000000_fix_credit_ownership_updated_at.sql` (adds the column) — **the only one that breaks a user flow** |
| 🟡 `credit_transactions` ↔ `profiles` join 400 | Receipt "Transaction not found" (certificates fall back OK) | Fix FK relationship names or add a simple fallback query |
| 🟡 `wallet_accounts` 400 | Possible wallet display issues | Check column name / RLS |
| 🟡 `certificate_type` / `certificate_data` columns missing | None (fallback works) | Add columns or adjust service |
| ⚠️ `paymongo-webhook/index.ts` has **unresolved Git conflict markers** | Blocks clean deployment | Resolve before deploy (per `SYSTEM_GUIDE.md`) |
| ⚠️ `package.json` setup scripts don't match files on disk | Setup scripts fail | Align `scripts/setup/` layout with `setup:supabase` / `setup:accounts` |

---

## 7. Recommended Build Order (from the task list + playbook)

| Milestone | Focus | Why |
|---|---|---|
| **M1 — Money foundation** 🔴 | Server-side payments, webhook-as-truth, ledger, idempotency, reconciliation | Makes real money *safe* — the base everything else needs |
| **M2 — Get sellers paid** 🔴 | Seller payouts + KYB + sales dashboard + price mgmt; real-credit supplier API | Today developers can't get paid → not a real marketplace |
| **M3 — Workflow + reporting** 🟠 | Edit/resubmit, comment thread, verifier checklist, admin finance console, ESG report | Finish the core developer↔verifier↔buyer loops |
| **M4 — Compliance** 🟠 | System config, report exports, AML + DPA tooling, user lifecycle | Operate legally with real money |
| **M5 — Experience & LGU** 🟢 | Buyer cart/watchlist; LGU exports/charts | Adoption |
| **M6 — Scale & transparency** 🟢 | Public registry, DR/backups, oversell hardening | Production hardening |
| **M7 — Future** ⏳ | Blockchain, Article 6, VVB, accredited methodologies | Mostly business/legal, not code |

> **Single most impactful next step:** **M1 (money foundation) + seller payouts.** Until money is server-side-safe and developers can cash out, Ecolink can't operate as a real marketplace. Everything else builds cleanly on that base.

---

## 8. The Honest Bottom Line

- **As an academic capstone:** Ecolink is **excellent and largely feature-complete** (8.7/10). It demonstrates the full carbon-credit lifecycle with real, credible software mechanics — and in *digital MRV* it's arguably ahead of where many real registries were until recently.
- **As a real, live platform:** the remaining work is **~40% software, ~60% business/legal** (per the go-live playbook). The software gaps (money safety, payouts, real-credit API, public registry) are buildable. The institutional gaps (accredited VVBs, approved methodologies, national-registry interoperability, BSP/AMLA/DPA/BIR compliance) need **partners, lawyers, and accreditation — not just code.**
- **Fastest path to "real":** plug into an existing credit-supplier API (Carbonmark/Cloverly/Patch) for real verified credits + a licensed PH PSP (PayMongo/Xendit/EMI) for real money — rather than trying to become a registry from scratch.

---

## Reference Docs (in this folder)
- `ECOLINK_SYSTEM_ANALYSIS.md` — full system analysis vs. SRD + market benchmark
- `IMPLEMENTATION_TASKLIST.md` — detailed prioritized backlog
- `CARBONIFY_BOARD_UPDATED.md` — original 14-week MVP plan vs. actual status
- `SYSTEM_GUIDE.md` — architecture & how the code is put together
- `PAYMENTS_ARCHITECTURE.md` — target real-money/wallet/ledger architecture
- `REAL_WORLD_GOLIVE_PLAYBOOK.md` — path to real credits + real money
- `VENDOR_SCORECARD_AND_TECH_DESIGN.md` — vendor evaluation + provider-agnostic tech design
- `CONSOLE_ERRORS_AFTER_PAYMENT.md` — known post-payment console errors & fixes
- `role-needs/` — per-role needs & gaps
