interface ScanFormProps {
  action: (formData: FormData) => Promise<void>;
  label: string;
  placeholder: string;
  defaultValue?: string;
}

export default function ScanForm({ action, label, placeholder, defaultValue }: ScanFormProps) {
  return (
    <form action={action} className="w-full max-w-2xl card p-5">
      <label htmlFor="scan-input" className="block text-sm font-semibold text-slate-700 mb-3">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="scan-input"
          name="query"
          type="text"
          required
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono text-sm"
        />
        <button
          type="submit"
          className="px-8 py-3.5 bg-brand text-white font-semibold rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          Scannen
        </button>
      </div>
    </form>
  );
}
