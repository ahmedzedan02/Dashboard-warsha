import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { SelectOption } from '@/shared/types/common';

const EMPTY_SELECT_VALUE = '__all__';

type FilterField =
  | {
      key: string;
      type: 'text' | 'date';
      label: string;
      placeholder?: string;
      value?: string;
    }
  | {
      key: string;
      type: 'select';
      label: string;
      placeholder?: string;
      value?: string;
      options: SelectOption[];
    };

interface FilterBarProps {
  fields: FilterField[];
  onChange: (key: string, value: string) => void;
}

export const FilterBar = ({ fields, onChange }: FilterBarProps) => (
  <div className="card-surface mb-6 grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
    {fields.map((field) =>
      field.type === 'select' ? (
        <div className="space-y-2" key={field.key}>
          <label className="text-xs font-medium uppercase tracking-wide text-brand-light">{field.label}</label>
          <Select
            value={field.value && field.value.length > 0 ? field.value : EMPTY_SELECT_VALUE}
            onValueChange={(value) => onChange(field.key, value === EMPTY_SELECT_VALUE ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder ?? field.label} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem
                  key={String(option.value) || EMPTY_SELECT_VALUE}
                  value={String(option.value) === '' ? EMPTY_SELECT_VALUE : String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2" key={field.key}>
          <label className="text-xs font-medium uppercase tracking-wide text-brand-light">{field.label}</label>
          <Input
            type={field.type}
            value={field.value ?? ''}
            placeholder={field.placeholder}
            onChange={(event) => onChange(field.key, event.target.value)}
          />
        </div>
      ),
    )}
  </div>
);

FilterBar.displayName = 'FilterBar';
