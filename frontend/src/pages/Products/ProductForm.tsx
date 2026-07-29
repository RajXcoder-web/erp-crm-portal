import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";

const emptyForm = { name: "", sku: "", category: "", unitPrice: "", currentStock: "0", minStockAlert: "0", location: "" };

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then((res) =>
        setForm({ ...res.data, unitPrice: String(res.data.unitPrice), currentStock: String(res.data.currentStock), minStockAlert: String(res.data.minStockAlert) })
      );
    }
  }, [id]);

  function update(field: string, value: string) {
    setForm((f: any) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...form,
      unitPrice: Number(form.unitPrice),
      currentStock: Number(form.currentStock),
      minStockAlert: Number(form.minStockAlert),
    };
    try {
      if (isEdit) {
        await api.patch(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      navigate("/products");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save product");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? "Edit Product" : "Add Product"}</h1>
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <Field label="Name" value={form.name} onChange={(v) => update("name", v)} required />
        <Field label="SKU / Code" value={form.sku} onChange={(v) => update("sku", v)} required />
        <Field label="Category" value={form.category || ""} onChange={(v) => update("category", v)} />
        <Field label="Unit Price" type="number" value={form.unitPrice} onChange={(v) => update("unitPrice", v)} required />
        <Field label="Current Stock" type="number" value={form.currentStock} onChange={(v) => update("currentStock", v)} />
        <Field label="Minimum Stock Alert" type="number" value={form.minStockAlert} onChange={(v) => update("minStockAlert", v)} />
        <Field label="Location / Warehouse" value={form.location || ""} onChange={(v) => update("location", v)} />

        <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-md px-4 py-2">
          Save Product
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
