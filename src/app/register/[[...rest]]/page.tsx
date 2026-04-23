import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <SignUp 
        routing="path" 
        path="/register" 
        // This metadata is sent to your webhook automatically
        unsafeMetadata={{
          requested_role: "PATIENT" 
        }}
      />
    </div>
  );
}