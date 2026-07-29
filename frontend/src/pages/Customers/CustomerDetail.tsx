import { useEffect, useState, FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [note, setNote] = useState("");

  function load() {
    api.get(`/customers/${id}`).then((res) => setCustomer(res.data));
  }

  useEffect(load, [id]);

  async function addFollowUp(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await api.post(`/customers/${id}/follow-ups`, { note });
    setNote("");
    load();
  }

  if (!customer) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{customer.name}</h1>
        <Link to={`/customers/${id}/edit`} className="text-brand-600 text-sm hover:underline">Edit</Link>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6 grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-slate-500">Mobile:</span> {customer.mobile}</div>
        <div><span className="text-slate-500">Email:</span> {customer.email || "-"}</div>
        <div><span className="text-slate-500">Business:</span> {customer.businessName || "-"}</div>
        <div><span className="text-slate-500">GST:</span> {customer.gstNumber || "-"}</div>
        <div><span className="text-slate-500">Type:</span> {customer.type}</div>
        <div><span className="text-slate-500">Status:</span> {customer.status}</div>
        <div className="col-span-2"><span className="text-slate-500">Address:</span> {customer.address || "-"}</div>
      </div>

      <h2 className="text-md font-semibold mb-2">Follow-up Notes</h2>
      <form onSubmit={addFollowUp} className="flex gap-2 mb-4">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a follow-up note..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-md px-4 py-2">Add</button>
      </form>

      <ul className="space-y-2">
        {customer.followUps?.map((f: any) => (
          <li key={f.id} className="bg-white border border-slate-200 rounded-md px-3 py-2 text-sm">
            <div>{f.note}</div>
            <div className="text-xs text-slate-400 mt-1">{new Date(f.createdAt).toLocaleString()}</div>
          </li>
        ))}
        {customer.followUps?.length === 0 && <li className="text-slate-400 text-sm">No follow-ups yet.</li>}
      </ul>
    </div>
  );
}
