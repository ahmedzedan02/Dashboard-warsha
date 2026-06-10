import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { useEmergencyPackageQuery, useSaveEmergencyPackageMutation } from '@/modules/emergency/hooks/useEmergencyPackageQuery';
import { useServicePriceListQuery, useServicesQuery } from '@/modules/services/hooks/useServicesQuery';
import { formatCurrency, formatDate } from '@/shared/utils/format';

interface EmergencyPackageFormValues {
  name: string;
  price: number;
  services: string[];
  isActive: boolean;
}

export const EmergencyPackagePage = () => {
  const packageQuery = useEmergencyPackageQuery();
  const servicesQuery = useServicesQuery({ page: 1, pageSize: 1000 });
  const servicePriceListQuery = useServicePriceListQuery();
  const services = servicesQuery.data?.data?.data?.length ? servicesQuery.data.data.data : servicePriceListQuery.data?.data ?? [];
  const packages = [...(packageQuery.data?.data ?? [])].sort(
    (left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime(),
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const currentPackage = packages.find((item) => item.id === selectedPackageId) ?? packages.find((item) => item.isActive) ?? packages[0];
  const saveMutation = useSaveEmergencyPackageMutation();
  const editForm = useForm<EmergencyPackageFormValues>({
    defaultValues: {
      name: '',
      price: 0,
      services: [],
      isActive: true,
    },
  });
  const createForm = useForm<EmergencyPackageFormValues>({
    defaultValues: {
      name: '',
      price: 0,
      services: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (currentPackage) {
      editForm.reset({
        name: currentPackage.name,
        price: currentPackage.price,
        services: currentPackage.serviceIds,
        isActive: currentPackage.isActive ?? true,
      });
      return;
    }

    editForm.reset({
      name: '',
      price: 0,
      services: [],
      isActive: true,
    });
  }, [currentPackage, editForm]);

  const loadPackageIntoForm = (packageItem: (typeof packages)[number]) => {
    setSelectedPackageId(packageItem.id);
    editForm.reset({
      name: packageItem.name,
      price: packageItem.price,
      services: packageItem.serviceIds,
      isActive: packageItem.isActive ?? true,
    });
  };

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Home' }, { label: 'Emergency Package' }]}
        title="Emergency Package"
        actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button">Add New Package</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add New Emergency Package</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-5 overflow-y-auto pr-2"
                style={{ maxHeight: 'calc(85vh - 96px)' }}
                onSubmit={createForm.handleSubmit(async (values) => {
                  await saveMutation.mutateAsync({
                    packageId: undefined,
                    payload: {
                      name: values.name,
                      price: values.price,
                      serviceIds: values.services,
                      isActive: values.isActive,
                    },
                    hasExistingPackage: false,
                  });
                  createForm.reset({
                    name: '',
                    price: 0,
                    services: [],
                    isActive: true,
                  });
                  setIsCreateDialogOpen(false);
                })}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Package Name</label>
                  <Input {...createForm.register('name')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input type="number" {...createForm.register('price', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Services</label>
                  <div className="grid max-h-72 gap-3 overflow-y-auto rounded-xl border border-muted p-3 md:grid-cols-2">
                    {services.map((service) => (
                      <label className="flex items-center gap-2 rounded-xl border border-muted p-3" key={`create-${service.id}`}>
                        <input type="checkbox" value={service.id} {...createForm.register('services')} />
                        {service.name ?? service.nameEn ?? service.nameAr ?? service.id}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...createForm.register('isActive')} />
                  Active package
                </label>
                <Button disabled={saveMutation.isPending} type="submit">
                  Create Package
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="card-surface max-w-3xl p-6">
        {packages.length > 0 ? (
          <div>
            <h3 className="text-base font-medium">Packages</h3>
            <div className="mt-4 space-y-3">
              {packages.map((item) => (
                <div className={`rounded-2xl border p-4 ${currentPackage?.id === item.id ? 'border-brand bg-brand-lighter/30' : 'border-muted'}`} key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        {currentPackage?.id === item.id ? (
                          <span className="rounded-full bg-brand px-2 py-1 text-[11px] text-white">Selected</span>
                        ) : null}
                      </div>
                      <p className="text-sm text-brand-light">{formatCurrency(item.price)}</p>
                      <p className="text-xs text-brand-light">{formatDate(item.createdAt, 'dd MMM yyyy p')}</p>
                    </div>
                    <span className="text-xs text-brand-light">{item.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button type="button" variant="outline" onClick={() => loadPackageIntoForm(item)}>
                      Load Into Form
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedPackageId(item.id);
                        setShowDeactivateConfirm(true);
                      }}
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {currentPackage ? (
          <form
            className="mt-8 space-y-5 border-t border-muted pt-6"
            onSubmit={editForm.handleSubmit(async (values) => {
              await saveMutation.mutateAsync({
                packageId: currentPackage.id,
                payload: {
                  name: values.name,
                  price: values.price,
                  serviceIds: values.services,
                  isActive: values.isActive,
                },
                hasExistingPackage: true,
              });
            })}
          >
            <div>
              <p className="text-sm text-brand-light">Editing Package</p>
              <h3 className="text-base font-medium">{currentPackage.name}</h3>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Package Name</label>
              <Input {...editForm.register('name')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price</label>
              <Input type="number" {...editForm.register('price', { valueAsNumber: true })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...editForm.register('isActive')} />
              Active package
            </label>
            <div className="flex gap-3">
              <Button disabled={saveMutation.isPending} type="submit">
                Update Package
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowDeactivateConfirm(true)}>
                Deactivate Current Package
              </Button>
            </div>
          </form>
        ) : null}
      </div>
      <ConfirmDialog
        open={showDeactivateConfirm}
        title="Deactivate Package"
        description="This will mark the current emergency package as inactive."
        isLoading={saveMutation.isPending}
        onCancel={() => setShowDeactivateConfirm(false)}
        onConfirm={async () => {
          if (!currentPackage) {
            setShowDeactivateConfirm(false);
            return;
          }

          await saveMutation.mutateAsync({
            packageId: currentPackage.id,
            payload: {
              name: currentPackage.name,
              price: currentPackage.price,
              serviceIds: currentPackage.serviceIds,
              isActive: false,
            },
            hasExistingPackage: true,
          });
          setShowDeactivateConfirm(false);
        }}
      />
    </div>
  );
};

EmergencyPackagePage.displayName = 'EmergencyPackagePage';
