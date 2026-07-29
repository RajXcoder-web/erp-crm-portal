import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { search: search || undefined } })
      .then((res) => setProducts(res.data.items))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link to="/products/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-md px-4 py-2">
          + Add Product
        </Link>
      </div>

      <input
        placeholder="Search by name or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Unit Price</th>
              <th className="px-4 py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-3 text-slate-400" colSpan={5}>Loading...</td></tr>}
            {!loading && products.length === 0 && (
              <tr><td className="px-4 py-3 text-slate-400" colSpan={5}>No products found.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link to={`/products/${p.id}/edit`} className="text-brand-600 hover:underline">{p.name}</Link>
                </td>
                <td className="px-4 py-2">{p.sku}</td>
                <td className="px-4 py-2">{p.category || "-"}</td>
                <td className="px-4 py-2">₹{p.unitPrice}</td>
                <td className="px-4 py-2">
                  <span className={p.currentStock <= p.minStockAlert ? "text-red-600 font-medium" : ""}>
                    {p.currentStock}
                  </span>
                  {p.currentStock <= p.minStockAlert && (
                    <span className="ml-2 text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Low stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
