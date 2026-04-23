import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <SignIn signUpUrl="/register" forceRedirectUrl="/dashboard" />
    </div>
  );
}