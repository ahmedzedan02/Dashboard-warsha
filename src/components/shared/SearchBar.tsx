import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  dir?: 'ltr' | 'rtl';
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  delay = 300,
  dir = 'ltr',
}: SearchBarProps) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onChange(draft);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, draft, onChange]);

  return (
    <div className="card-surface p-4" dir={dir}>
      <div className="flex items-center gap-2">
        <Input placeholder={placeholder} value={draft} onChange={(event) => setDraft(event.target.value)} />
        {draft ? (
          <Button size="icon" type="button" variant="outline" onClick={() => setDraft('')}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
