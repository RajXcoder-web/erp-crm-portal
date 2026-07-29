import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  businessName?: string;
  type: string;
  status: string;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/customers", { params: { search: search || undefined } })
      .then((res) => setCustomers(res.data.items))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Customers</h1>
        <Link to="/customers/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-md px-4 py-2">
          + Add Customer
        </Link>
      </div>

      <input
        placeholder="Search by name, mobile, or business..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">Business</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-4 py-3 text-slate-400" colSpan={5}>Loading...</td></tr>
            )}
            {!loading && customers.length === 0 && (
              <tr><td className="px-4 py-3 text-slate-400" colSpan={5}>No customers found.</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link to={`/customers/${c.id}`} className="text-brand-600 hover:underline">{c.name}</Link>
                </td>
                <td className="px-4 py-2">{c.mobile}</td>
                <td className="px-4 py-2">{c.businessName || "-"}</td>
                <td className="px-4 py-2">{c.type}</td>
                <td className="px-4 py-2">
                  <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs">{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
