import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] animate-blob" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px] animate-blob animation-delay-4000" />
            </div>

            <LoginForm />
        </div>
    );
}
