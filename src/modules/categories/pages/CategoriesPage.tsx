import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Badge } from '@/shared/components/ui/badge';
import {
  useAddCategoryMutation,
  useCategoriesQuery,
  useDeleteCategoryMutation,
  useSetCategoryActiveMutation,
} from '@/modules/categories/hooks/useCategoriesQuery';

interface CategoryFormValues {
  nameEn: string;
  nameAr: string;
}

export const CategoriesPage = () => {
  const categoriesQuery = useCategoriesQuery();
  const addMutation = useAddCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const activeMutation = useSetCategoryActiveMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const categories = categoriesQuery.data?.data ?? [];

  const form = useForm<CategoryFormValues>({
    defaultValues: {
      nameEn: '',
      nameAr: '',
    },
  });

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Categories' }]} title="Categories" />
      <div className="max-w-xl space-y-6">
        <div className="card-surface p-5">
          <h2 className="mb-4 text-base font-semibold text-brand-dark">Add New Category</h2>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              await addMutation.mutateAsync(values);
              form.reset();
            })}
          >
            <Input placeholder="Name EN" {...form.register('nameEn')} />
            <Input placeholder="Name AR" {...form.register('nameAr')} />
            <Button className="w-full" disabled={addMutation.isPending} type="submit">
              Add Category
            </Button>
          </form>
        </div>

        <div className="card-surface p-5">
          <h2 className="mb-4 text-base font-semibold text-brand-dark">Category List</h2>
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                className="rounded-2xl border border-muted bg-white p-4"
                key={category.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-dark">{category.name}</p>
                    <div className="mt-2">
                      <Badge variant={category.isActive ? 'success' : 'danger'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => activeMutation.mutate({ categoryId: category.id, isActive: !category.isActive })}>
                      {category.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(category.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ConfirmDialog
        description="Deleting this category will remove it from the service structure."
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await deleteMutation.mutateAsync(deleteId);
          setDeleteId(null);
        }}
        open={Boolean(deleteId)}
        title="Delete Category"
      />
    </div>
  );
};

CategoriesPage.displayName = 'CategoriesPage';
