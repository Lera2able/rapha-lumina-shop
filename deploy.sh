#!/bin/bash
export SUPABASE_ACCESS_TOKEN="sbp_30…348a"
npx supabase functions deploy create_paystack_checkout --no-verify-jwt
npx supabase functions deploy verify_paystack_payment --no-verify-jwt  
npx supabase functions deploy paystack_webhook --no-verify-jwt
