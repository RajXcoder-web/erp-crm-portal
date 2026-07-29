import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

const statusColor: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function ChallanList() {
  const [challans, setChallans] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/challans", { params: { status: status || undefined } }).then((res) => setChallans(res.data.items)).finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Sales Challans</h1>
        <Link to="/challans/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-md px-4 py-2">
          + New Challan
        </Link>
      </div>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm">
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Challan #</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Total Qty</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-3 text-slate-400" colSpan={5}>Loading...</td></tr>}
            {!loading && challans.length === 0 && <tr><td className="px-4 py-3 text-slate-400" colSpan={5}>No challans found.</td></tr>}
            {challans.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link to={`/challans/${c.id}`} className="text-brand-600 hover:underline">{c.challanNumber}</Link>
                </td>
                <td className="px-4 py-2">{c.customer?.name}</td>
                <td className="px-4 py-2">{c.totalQuantity}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusColor[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-4 py-2">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
