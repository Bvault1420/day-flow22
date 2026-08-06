interface FormProps {
  action: (formData: FormData) => Promise<void>;
  label: string;
  placeholder: string;
  defaultValue?: string;
}

export default function ScanForm({ action, label, placeholder, defaultValue }: FormProps) {
  return (
    <form action={action} className="card p-5 max-w-2xl w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-3">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          name="query"
          type="text"
          required
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
        <button type="submit" className="px-8 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 cursor-pointer">
          Scannen
        </button>
      </div>
    </form>
  );
}
