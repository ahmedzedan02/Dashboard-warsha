import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import {
  useAddCategoryMutation,
  useCategoriesQuery,
  useCategoryServicesQuery,
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const servicesQuery = useCategoryServicesQuery(selectedCategoryId ?? undefined);
  const categories = categoriesQuery.data?.data ?? [];
  const serviceTypes = servicesQuery.data?.data ?? [];
  const form = useForm<CategoryFormValues>({
    defaultValues: {
      nameEn: '',
      nameAr: '',
    },
  });

  useEffect(() => {
    const firstCategory = categories[0]?.id;
    if (!selectedCategoryId && firstCategory) {
      setSelectedCategoryId(firstCategory);
    }
  }, [categories, selectedCategoryId]);

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Categories' }]} title="Categories" />
      <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
        <div className="card-surface p-5">
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
          <div className="mt-5 space-y-3">
            {categories.map((category) => (
              <div
                className={`rounded-2xl border p-4 ${selectedCategoryId === category.id ? 'border-brand bg-brand-lighter' : 'border-muted bg-white'}`}
                key={category.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <button className="text-left" onClick={() => setSelectedCategoryId(category.id)} type="button">
                    <p className="font-medium">{category.nameEn}</p>
                    <p className="text-sm text-brand-light">{category.nameAr}</p>
                  </button>
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
        <div className="card-surface p-5">
          <h2 className="mb-4 text-lg">Service Types</h2>
          <div className="space-y-3">
            {serviceTypes.map((service) => (
              <div className="rounded-xl bg-brand-lighter p-4" key={service.id}>
                <p className="font-medium">{service.nameEn}</p>
                <p className="text-sm text-brand-light">{service.nameAr}</p>
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
