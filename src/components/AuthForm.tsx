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
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'register';
  onModeToggle?: () => void;
}

export function AuthForm({ type, onModeToggle }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.login);

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    ...(type === 'register' && {
      name: z.string().min(2),
      confirmPassword: z.string().min(6),
      role: z.enum(['employer', 'candidate']),
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
    defaultValues: {
       role: 'candidate'
    }
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      if (type === 'register') {
        await axios.post('/api/auth/register', { ...data, role: data.role });
        toast.success('Registration successful. You can now login.');
        if (onModeToggle) onModeToggle();
      } else {
        const res = await axios.post('/api/auth/login', { email: data.email, password: data.password });
        setAuth(res.data.user, res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        router.push(`/${res.data.user.role}/dashboard`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto shadow-xl border-none ring-1 ring-slate-100 ${type === 'login' ? 'rounded-[16px] p-2 mt-4' : ''}`}>
      {type === 'register' && (
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Create an account
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Enter your details to register platform access.
            </CardDescription>
          </CardHeader>
      )}
      <CardContent className={type === 'login' ? 'pt-6 pb-8 px-8' : ''}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {type === 'register' && (
            <>
                <div className="space-y-2.5 mb-2">
                  <Label className="text-[14px]">I am registering as an:</Label>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-2 border border-[#CBD5E1] rounded-[8px] p-3 flex-1 cursor-pointer has-[:checked]:border-[#6633FF] has-[:checked]:bg-[#6633FF]/5 transition-colors">
                          <input type="radio" value="employer" {...register('role')} className="w-4 h-4 text-[#6633FF] accent-[#6633FF]" />
                          <span className="text-[14px] font-semibold text-[#1B1C31]">Employer</span>
                      </label>
                      <label className="flex items-center gap-2 border border-[#CBD5E1] rounded-[8px] p-3 flex-1 cursor-pointer has-[:checked]:border-[#6633FF] has-[:checked]:bg-[#6633FF]/5 transition-colors">
                          <input type="radio" value="candidate" {...register('role')} className="w-4 h-4 text-[#6633FF] accent-[#6633FF]" />
                          <span className="text-[14px] font-semibold text-[#1B1C31]">Candidate</span>
                      </label>
                  </div>
                  {errors.role && <p className="text-sm text-red-500">{errors.role.message as string}</p>}
                </div>
                
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
            </>
          )}
          
          <div className="space-y-1.5">
            <Label htmlFor="email" className={type === 'login' ? 'text-[13px] font-semibold text-[#475569]' : ''}>{type === 'login' ? 'Email/ User ID' : 'Email'}</Label>
            <Input
              id="email"
              type="text"
              placeholder={type === 'login' ? "Enter your email/User ID" : "name@example.com"}
              {...register('email')}
              className={`${type === 'login' ? 'h-11 border-[#CBD5E1] rounded-[8px] text-[14px] placeholder:text-[#94A3B8]' : ''} ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className={type === 'login' ? 'text-[13px] font-semibold text-[#475569]' : ''}>Password</Label>
            <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={type === 'login' ? "Enter your password" : ""}
                  {...register('password')}
                  className={`${type === 'login' ? 'h-11 border-[#CBD5E1] rounded-[8px] text-[14px] placeholder:text-[#94A3B8] pr-10' : ''} ${errors.password ? 'border-red-500' : ''}`}
                />
                {type === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex items-center justify-center -translate-y-[45%] text-[#94A3B8] hover:text-[#4A4B68] transition-colors"
                  >
                    {showPassword ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
                  </button>
                )}
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message as string}</p>}
            {type === 'login' && (
               <div className="flex justify-end w-full pt-1">
                   <span className="text-[12.5px] font-bold text-[#4A4B68] cursor-pointer hover:underline">Forget Password?</span>
               </div>
            )}
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

          <Button 
            type="submit" 
            className={type === 'login' ? 'w-full h-[46px] text-[15px] font-bold tracking-wide rounded-[8px] bg-[#6633FF] hover:bg-[#6633FF]/90 mt-4 shadow-sm' : 'w-full h-11 text-base shadow-md'} 
            disabled={loading}
          >
            {loading ? 'Please wait...' : type === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      {type === 'register' && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account? 
              <button
                type="button"
                onClick={() => onModeToggle && onModeToggle()}
                className="text-primary hover:underline font-semibold ml-1"
              >
                Sign in
              </button>
            </p>
          </CardFooter>
      )}
    </Card>
  );
}
