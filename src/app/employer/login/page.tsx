import { AuthForm } from "@/components/AuthForm";

export default function EmployerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <AuthForm type="login" role="employer" />
    </div>
  );
}
