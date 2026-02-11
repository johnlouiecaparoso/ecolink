// Supabase Edge Function: PayMongo Checkout Session
// This runs server-side to create PayMongo checkout sessions securely

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const PAYMONGO_SECRET_KEY = Deno.env.get('PAYMONGO_SECRET_KEY') || ''
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1'

// CORS headers required when invoking from browser (localhost or production).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

const authHeader = () => ({
  Authorization: `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`,
  'Content-Type': 'application/json',
})

/** Verify a checkout session and return payment details (for callback page; keeps secret server-side). */
async function verifyCheckoutSession(sessionId: string) {
  const sessionRes = await fetch(`${PAYMONGO_API_URL}/checkout_sessions/${sessionId}`, {
    method: 'GET',
    headers: authHeader(),
  })
  if (!sessionRes.ok) {
    const err = await sessionRes.json().catch(() => ({}))
    throw new Error(err.errors?.[0]?.detail || 'Failed to retrieve checkout session')
  }
  const sessionData = await sessionRes.json()
  const paymentId =
    sessionData.data?.attributes?.payments?.[0]?.id ?? sessionData.data?.attributes?.payments?.[0]
  if (!paymentId) throw new Error('No payment found in session')

  const paymentRes = await fetch(`${PAYMONGO_API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: authHeader(),
  })
  if (!paymentRes.ok) throw new Error('Failed to retrieve payment')
  const paymentData = await paymentRes.json()

  const attrs = paymentData.data?.attributes ?? {}
  let actualPaymentMethod = attrs.payment_method?.type ?? attrs.source?.type ?? attrs.payment_method_details?.type ?? 'unknown'
  const map: Record<string, string> = { card: 'card', credit_card: 'card', debit_card: 'card', gcash: 'gcash', paymaya: 'maya', grab_pay: 'grab_pay' }
  actualPaymentMethod = map[actualPaymentMethod] ?? actualPaymentMethod

  const payment = {
    id: paymentData.data?.id,
    amount: (attrs.amount ?? 0) / 100,
    currency: attrs.currency ?? 'PHP',
    status: attrs.status,
    description: attrs.description,
    fee: (attrs.fee ?? 0) / 100,
    payment_method: actualPaymentMethod,
  }

  return {
    success: payment.status === 'paid',
    payment,
    session: sessionData.data,
    paymentMethod: actualPaymentMethod,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Action: verify session (callback page – no secret in frontend)
    if (body.action === 'verify' && body.sessionId) {
      if (!PAYMONGO_SECRET_KEY) {
        return new Response(JSON.stringify({ error: 'PAYMONGO_SECRET_KEY not set in Edge Function' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const result = await verifyCheckoutSession(body.sessionId)
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Default: create checkout session
    const { data } = body
    if (!data) throw new Error('Missing data for checkout session')

    const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ data }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.errors?.[0]?.detail || 'Failed to create checkout session')
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
