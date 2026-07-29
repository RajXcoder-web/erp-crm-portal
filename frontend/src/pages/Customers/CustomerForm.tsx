import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  type: "RETAIL",
  address: "",
  status: "LEAD",
  notes: "",
};

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/customers/${id}`).then((res) => setForm(res.data));
    }
  }, [id]);

  function update(field: string, value: string) {
    setForm((f: any) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit) {
        await api.patch(`/customers/${id}`, form);
      } else {
        await api.post("/customers", form);
      }
      navigate("/customers");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save customer");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? "Edit Customer" : "Add Customer"}</h1>
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <Field label="Name" value={form.name} onChange={(v) => update("name", v)} required />
        <Field label="Mobile" value={form.mobile} onChange={(v) => update("mobile", v)} required />
        <Field label="Email" value={form.email || ""} onChange={(v) => update("email", v)} />
        <Field label="Business Name" value={form.businessName || ""} onChange={(v) => update("businessName", v)} />
        <Field label="GST Number" value={form.gstNumber || ""} onChange={(v) => update("gstNumber", v)} />

        <div>
          <label className="block text-sm font-medium mb-1">Customer Type</label>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <Field label="Address" value={form.address || ""} onChange={(v) => update("address", v)} />
        <Field label="Notes" value={form.notes || ""} onChange={(v) => update("notes", v)} />

        <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-md px-4 py-2">
          Save Customer
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
