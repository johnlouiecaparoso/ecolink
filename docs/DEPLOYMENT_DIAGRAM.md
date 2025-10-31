# EcoLink Deployment Diagram

Rendered with Mermaid for clarity. Adjust nodes to match your actual infra if you deploy beyond Supabase.

```mermaid
graph TD
  subgraph Client[Client Tier]
    Browser[User Browser]
  end

  subgraph Frontend[Frontend Hosting]
    ViteApp[Vue SPA (Vite build)]
  end

  subgraph Supabase[Supabase Platform]
    Auth[Auth Service]
    Postgrest[PostgREST API]
    Realtime[Realtime]
    Storage[Storage]
    Postgres[(PostgreSQL DB)]
  end

  subgraph Payments[External Payment Gateways]
    GCash[GCash API]
    Maya[Maya API]
  end

  Browser -->|HTTPS| ViteApp
  ViteApp -->|Auth SDK| Auth
  ViteApp -->|REST| Postgrest
  ViteApp -->|WS| Realtime
  ViteApp -->|Uploads| Storage
  Auth --> Postgres
  Postgrest --> Postgres
  Realtime --> Postgres
  ViteApp -->|Payment Requests| GCash
  ViteApp -->|Payment Requests| Maya
```

Notes:

- The SPA is typically deployed on static hosting (e.g., Netlify/Vercel/S3) but can be any web server.
- All data enforcement occurs in Postgres via RLS; frontend passes JWT from Auth SDK.



