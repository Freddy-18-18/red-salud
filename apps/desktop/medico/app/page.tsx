import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, Button } from "@red-salud/ui";
import { signOut } from '@/lib/supabase/auth'; // This is client side, need to handle signout

export default async function Page() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardContent className="p-6 space-y-4">
                    <h1 className="text-2xl font-bold text-foreground">Dashboard Médico</h1>
                    <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Sesión iniciada como:</p>
                        <p className="font-mono text-sm">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-2">ID: {user.id}</p>
                    </div>

                    <form action={async () => {
                        "use server";
                        const supabase = await createClient();
                        await supabase.auth.signOut();
                        redirect('/login');
                    }}>
                        <Button variant="destructive" className="w-full">
                            Cerrar Sesión
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
