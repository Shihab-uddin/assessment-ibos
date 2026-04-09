'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

interface AuthFormProps {
  type: 'login' | 'register';
  role: 'employer' | 'candidate';
}

export function AuthForm({ type, role }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.login);

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    ...(type === 'register' && {
      name: z.string().min(2),
      confirmPassword: z.string().min(6),
    }),
  }).refine((data) => {
    if (type === 'register') return data.password === data.confirmPassword;
    return true;
  }, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      if (type === 'register') {
        await axios.post('/api/auth/register', { ...data, role });
        toast.success('Registration successful. You can now login.');
        router.push(`/${role}/login`);
      } else {
        const res = await axios.post('/api/auth/login', { email: data.email, password: data.password, role });
        setAuth(res.data.user, res.data.token);
        // Add artificial delay for aesthetic transition
        toast.success(`Welcome back, ${res.data.user.name}!`);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        router.push(`/${role}/dashboard`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-none ring-1 ring-slate-100">
      <CardHeader className="space-y-2 text-center pb-8">
        <CardTitle className="text-3xl font-bold tracking-tight">
          {type === 'login' ? 'Welcome back' : 'Create an account'}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {type === 'login'
            ? `Sign in to your ${role} account to continue`
            : `Enter your details to create your ${role} account`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message as string}</p>}
          </div>

          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base shadow-md" disabled={loading}>
            {loading ? 'Please wait...' : type === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => router.push(`/${role}/${type === 'login' ? 'register' : 'login'}`)}
            className="text-primary hover:underline font-semibold"
          >
            {type === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}
