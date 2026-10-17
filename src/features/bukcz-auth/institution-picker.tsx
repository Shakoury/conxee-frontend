import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Dialog } from './dialog';
import { Input } from '@/components/ui/input';
import { Button } from './common';
import { api } from './api';

export type Institution = { id: string; name: string; type: string };

/** Search remotely only while the selector is open; never dump the directory into signup. */
export function InstitutionPicker({
  value,
  onChange,
}: {
  value: Institution | null;
  onChange: (institution: Institution) => void;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState('');
  const [results, setResults] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false),
    [error, setError] = useState(false);
  const [more, setMore] = useState(false),
    [retry, setRetry] = useState(0);
  const [active, setActive] = useState(-1);
  const listId = useId(),
    trigger = useRef<HTMLButtonElement>(null);
  const term = query.trim();
  useEffect(() => {
    let current = true;
    setResults([]);
    setMore(false);
    setError(false);
    setActive(-1);
    if (!open || term.length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      void api<{ data: Institution[]; next_after: string | null }>(
        '/institutions?q=' + encodeURIComponent(term) + '&limit=20',
      )
        .then((page) => {
          if (current) {
            setResults(page.data);
            setMore(!!page.next_after);
          }
        })
        .catch(() => {
          if (current) setError(true);
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [open, term, retry]);
  useEffect(() => {
    if (active >= 0)
      document
        .getElementById(`${listId}-${active}`)
        ?.scrollIntoView({ block: 'nearest' });
  }, [active, listId]);
  function choose(institution: Institution) {
    onChange(institution);
    setOpen(false);
  }
  return (
    <div className="signup-institution-picker">
      <span id={`${listId}-label`}>Institution</span>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-labelledby={`${listId}-label`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${listId}-dialog` : undefined}
        className="campus-selection-trigger"
        onClick={() => {
          setQuery('');
          setOpen(true);
        }}
      >
        <span>{value?.name ?? 'Search and select your institution'}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      <Dialog
        returnFocusRef={trigger}
        open={open}
        onOpenChange={setOpen}
        title="Choose your institution"
        className="signup-institution-dialog"
      >
        <div id={`${listId}-dialog`}>
          <label>
            Search institutions
            <Input
              autoFocus
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded={term.length >= 2}
              aria-controls={listId}
              aria-activedescendant={
                active >= 0 ? `${listId}-${active}` : undefined
              }
              value={query}
              maxLength={100}
              autoComplete="off"
              placeholder="Type an institution name…"
              onChange={(event) => {
                setQuery(event.target.value);
                setResults([]);
                setActive(-1);
              }}
              onKeyDown={(event) => {
                if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
                  event.preventDefault();
                  if (results.length)
                    setActive((index) =>
                      event.key === 'ArrowDown'
                        ? (index + 1) % results.length
                        : index <= 0
                          ? results.length - 1
                          : index - 1,
                    );
                } else if (event.key === 'Enter') {
                  event.preventDefault();
                  if (active >= 0 && results[active]) choose(results[active]);
                }
              }}
            />
          </label>
          <div role="status" className="signup-institution-status">
            {term.length < 2
              ? 'Type at least 2 characters to find your institution.'
              : loading
                ? 'Searching institutions…'
                : error
                  ? 'Institutions could not load. Please try again.'
                  : !results.length
                    ? 'No institutions found. Try another name, or submit a missing institution from the form.'
                    : more
                      ? 'More matches are available. Refine your search to find your institution.'
                      : `${results.length} matching ${results.length === 1 ? 'institution' : 'institutions'}.`}
          </div>
          {error && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setRetry((version) => version + 1)}
            >
              Retry search
            </Button>
          )}
          <div
            id={listId}
            role="listbox"
            aria-label="Institution results"
            aria-busy={loading}
            className="signup-institutions"
          >
            {results.map((institution, index) => (
              <button
                type="button"
                role="option"
                tabIndex={-1}
                id={`${listId}-${index}`}
                key={institution.id}
                aria-selected={value?.id === institution.id}
                className={
                  active === index || value?.id === institution.id
                    ? 'selected'
                    : ''
                }
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(institution)}
              >
                {institution.name}
                <small>{institution.type.replaceAll('_', ' ')}</small>
              </button>
            ))}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
