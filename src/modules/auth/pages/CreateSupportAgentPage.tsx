import { useForm } from 'react-hook-form';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useCreateSupportAgentMutation } from '@/modules/auth/hooks/useLoginMutation';

interface CreateSupportAgentFormValues {
  adminName: string;
  adminUsername: string;
  adminPassword: string;
  isActive: boolean;
}

export const CreateSupportAgentPage = () => {
  const createMutation = useCreateSupportAgentMutation();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateSupportAgentFormValues>({
    defaultValues: {
      adminName: '',
      adminUsername: '',
      adminPassword: '',
      isActive: true,
    },
  });

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Create Support Agent' }]} title="Create Support Agent" />
      <div className="card-surface max-w-2xl p-6">
        <form
          className="space-y-5"
          onSubmit={handleSubmit(async (values) => {
            if (values.adminPassword.length < 6) {
              setError('adminPassword', { type: 'manual', message: 'Password must be at least 6 characters' });
              return;
            }

            const response = await createMutation.mutateAsync(values);
            if (response.isSuccess === false) {
              return;
            }

            reset();
          })}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input {...register('adminName')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input {...register('adminUsername')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input type="password" {...register('adminPassword')} />
            {errors.adminPassword ? <p className="text-xs text-red-600">{errors.adminPassword.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" {...register('isActive')} />
              Active account
            </label>
          </div>
          <Button disabled={createMutation.isPending} type="submit">
            {createMutation.isPending ? 'Creating...' : 'Create Support Agent'}
          </Button>
        </form>
      </div>
    </div>
  );
};

CreateSupportAgentPage.displayName = 'CreateSupportAgentPage';
