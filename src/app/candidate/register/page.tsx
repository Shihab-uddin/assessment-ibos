import { AuthForm } from "@/components/AuthForm";

export default function CandidateRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <AuthForm type="register" role="candidate" />
    </div>
  );
}
