import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

interface Line {
  productId: string;
  quantity: string;
}

export default function ChallanForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: "1" }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/customers", { params: { pageSize: 100 } }).then((res) => setCustomers(res.data.items));
    api.get("/products", { params: { pageSize: 100 } }).then((res) => setProducts(res.data.items));
  }, []);

  function updateLine(index: number, field: keyof Line, value: string) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setLines((ls) => [...ls, { productId: "", quantity: "1" }]);
  }

  function removeLine(index: number) {
    setLines((ls) => ls.filter((_, i) => i !== index));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        customerId,
        items: lines
          .filter((l) => l.productId)
          .map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
      };
      const { data } = await api.post("/challans", payload);
      navigate(`/challans/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create challan");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">New Sales Challan</h1>
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Select a customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.businessName ? ` — ${c.businessName}` : ""}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Products</label>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  required
                  value={line.productId}
                  onChange={(e) => updateLine(i, "productId", e.target.value)}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (SKU {p.sku}, stock {p.currentStock})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  required
                  value={line.quantity}
                  onChange={(e) => updateLine(i, "quantity", e.target.value)}
                  className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                {lines.length > 1 && (
                  <button type="button" onClick={() => removeLine(i)} className="text-red-500 text-sm">Remove</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addLine} className="mt-2 text-brand-600 text-sm hover:underline">+ Add another product</button>
        </div>

        <p className="text-xs text-slate-500">
          Saved as a Draft first — stock is only deducted once you confirm the challan on the next screen.
        </p>

        <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-md px-4 py-2">
          Save as Draft
        </button>
      </form>
    </div>
  );
}
