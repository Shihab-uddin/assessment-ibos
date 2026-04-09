import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50/50">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
          Online Assessment Platform
        </h1>
        <p className="text-xl text-slate-600">
          The ultimate platform for creating and taking robust online examinations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="p-8 space-y-4 bg-white rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">For Employers</h2>
            <p className="text-slate-600">Create tests, manage candidates, and review results effortlessly.</p>
            <div className="space-x-4 pt-4">
              <Button asChild>
                <Link href="/employer/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/employer/register">Register</Link>
              </Button>
            </div>
          </div>

          <div className="p-8 space-y-4 bg-white rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">For Candidates</h2>
            <p className="text-slate-600">Access your assessment dashboard and complete assigned tests securely.</p>
            <div className="space-x-4 pt-4">
              <Button asChild>
                <Link href="/candidate/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/candidate/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
