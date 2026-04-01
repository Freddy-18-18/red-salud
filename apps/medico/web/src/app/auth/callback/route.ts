import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const origin = request.nextUrl.origin;

  // OAuth cancelled or error
  if (error) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if doctor profile is complete
        const { data: doctorProfile } = await supabase
          .from('doctor_details')
          .select('profile_id, especialidad_id')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (!doctorProfile || !doctorProfile.especialidad_id) {
          return NextResponse.redirect(`${origin}/onboarding/complete-profile`);
        }

        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  // Fallback — no code, no session
  return NextResponse.redirect(`${origin}/auth/login`);
}
