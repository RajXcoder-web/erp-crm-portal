import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";

const statusColor: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function ChallanDetail() {
  const { id } = useParams();
  const [challan, setChallan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api.get(`/challans/${id}`).then((res) => setChallan(res.data));
  }

  useEffect(load, [id]);

  async function confirm() {
    setError(null);
    setBusy(true);
    try {
      await api.post(`/challans/${id}/confirm`);
      load();
    } catch (err: any) {
      // Surfaces backend stock-validation errors, e.g. insufficient stock for a line item
      setError(err.response?.data?.error || "Failed to confirm challan");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      await api.post(`/challans/${id}/cancel`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to cancel challan");
    } finally {
      setBusy(false);
    }
  }

  if (!challan) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{challan.challanNumber}</h1>
        <span className={`inline-block rounded-full px-3 py-1 text-xs ${statusColor[challan.status]}`}>{challan.status}</span>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

      <div className="bg-white p-6 rounded-lg border border-slate-200 mb-4 text-sm space-y-1">
        <div><span className="text-slate-500">Customer:</span> {challan.customer?.name}</div>
        <div><span className="text-slate-500">Total quantity:</span> {challan.totalQuantity}</div>
        <div><span className="text-slate-500">Created:</span> {new Date(challan.createdAt).toLocaleString()}</div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Unit Price (at time of order)</th>
              <th className="px-4 py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item: any) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{item.productNameSnapshot}</td>
                <td className="px-4 py-2">{item.skuSnapshot}</td>
                <td className="px-4 py-2">₹{item.unitPriceSnapshot}</td>
                <td className="px-4 py-2">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {challan.status === "DRAFT" && (
        <div className="flex gap-2">
          <button onClick={confirm} disabled={busy} className="bg-green-600 hover:bg-green-700 text-white text-sm rounded-md px-4 py-2 disabled:opacity-50">
            Confirm Challan (reduces stock)
          </button>
          <button onClick={cancel} disabled={busy} className="bg-white border border-slate-300 text-sm rounded-md px-4 py-2 disabled:opacity-50">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
