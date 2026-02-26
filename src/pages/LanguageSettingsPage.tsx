import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchSupportedLanguages, updateSupportedLanguages } from '../api/admin';

const ISO_LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' }
];

export function LanguageSettingsPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>(['en']);
  const [message, setMessage] = useState('');

  const languagesQuery = useQuery({
    queryKey: ['supported-languages'],
    queryFn: fetchSupportedLanguages
  });

  const updateMutation = useMutation({
    mutationFn: (languages: string[]) => updateSupportedLanguages(languages),
    onSuccess: async (data) => {
      setMessage(`Enabled languages updated: ${data.supported_languages.join(', ')}`);
      await queryClient.invalidateQueries({ queryKey: ['supported-languages'] });
    },
    onError: () => setMessage('Failed to update supported languages')
  });

  const current = languagesQuery.data?.supported_languages?.length
    ? languagesQuery.data.supported_languages
    : ['en'];
  const listedOptions = languagesQuery.data?.options ?? [{ code: 'en', name: 'English', enabled: true }];

  useEffect(() => {
    setEnabledLanguages(current);
  }, [languagesQuery.data?.supported_languages?.join(',')]);

  const addLanguage = () => {
    const normalized = input.trim().toLowerCase().slice(0, 2);
    if (!normalized || enabledLanguages.includes(normalized)) return;
    if (ISO_LANGUAGE_OPTIONS.some((item) => item.code === normalized)) {
      setEnabledLanguages((prev) => [...prev, normalized]);
    }
    setInput('');
  };

  const toggleLanguage = (code: string) => {
    if (enabledLanguages.includes(code)) {
      const next = enabledLanguages.filter((lang) => lang !== code);
      if (!next.length) return;
      setEnabledLanguages(next);
      return;
    }
    setEnabledLanguages((prev) => [...prev, code]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Language Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure platform-supported ISO languages. Entries are retained once added and can be enabled/disabled.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">Current: {current.join(', ')}</p>
        <form
          className="mt-3 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const unique = Array.from(new Set(enabledLanguages.map((v) => v.trim().toLowerCase()).filter(Boolean)));
            updateMutation.mutate(unique.length ? unique : ['en']);
          }}
        >
          <input
            list="language-suggestions"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add ISO code (e.g., es)"
            className="min-w-[280px] rounded-md border border-slate-300 px-3 py-2 text-sm uppercase"
          />
          <datalist id="language-suggestions">
            {ISO_LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </datalist>
          <button
            type="button"
            onClick={addLanguage}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            Add
          </button>
          <button
            disabled={updateMutation.isPending}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Languages'}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {listedOptions.map((option) => {
            const checked = enabledLanguages.includes(option.code);
            return (
              <label
                key={option.code}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">
                  {option.name} <span className="text-slate-400">({option.code})</span>
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleLanguage(option.code)}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Languages remain listed once added. Disable instead of deleting.
        </p>
        {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
      </div>
    </div>
  );
}
