import { createApiClient } from "@red-salud/api-client";

import { supabase } from "@/lib/supabase/client";

const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
if (!gatewayUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_GATEWAY_URL is not set. Add it to apps/paciente/web/.env.local",
  );
}

// Single client per browser session. Auth header is resolved per-request from
// the live Supabase session, so token rotation is transparent to callers.
export const gateway = createApiClient({
  gatewayUrl: `${gatewayUrl.replace(/\/$/, "")}/api/v1`,
  getAccessToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },
});
