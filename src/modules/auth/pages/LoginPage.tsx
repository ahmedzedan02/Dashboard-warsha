import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { authStore } from '@/modules/auth/store/authStore';
import { loginSchema, type LoginSchema } from '@/modules/auth/utils/authSchemas';
import { useLoginMutation } from '@/modules/auth/hooks/useLoginMutation';

export const LoginPage = () => {
  const navigate = useNavigate();
  const accessToken = authStore((state) => state.accessToken);
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (loginMutation.isSuccess) {
      navigate('/', { replace: true });
    }
  }, [loginMutation.isSuccess, navigate]);

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="card-surface w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Warsha Admin</h1>
          <p className="mt-2 text-sm text-brand-light">Sign in to manage operations and service providers.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input placeholder="admin@example.com" {...register('username')} />
            {errors.username ? <p className="text-xs text-red-600">{errors.username.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
          </div>
          <Button className="w-full" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

LoginPage.displayName = 'LoginPage';
