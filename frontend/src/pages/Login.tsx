import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/customers");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-paper-100 font-body">
      {/* Left panel — brand + signature challan stub */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 relative overflow-hidden flex-col justify-between px-14 py-12">
        <div>
          <div className="font-display text-paper-50 text-2xl tracking-wide uppercase">
            Ledgerline
          </div>
          <div className="font-data text-line text-xs tracking-widest uppercase mt-1">
            ERP + CRM Operations Portal
          </div>
        </div>

        <div className="relative">
          <p className="font-display text-paper-50 text-3xl leading-tight max-w-sm mb-10">
            Every challan, every stock move, one register.
          </p>

          {/* Signature element: a stylized sales challan stub */}
          <div className="relative w-80 -rotate-2">
            <div
              className="bg-paper-50 shadow-[0_20px_40px_rgba(0,0,0,0.35)] px-6 py-6 relative"
              style={{
                clipPath:
                  "polygon(0% 4px, 2% 0%, 4% 4px, 6% 0%, 8% 4px, 10% 0%, 12% 4px, 14% 0%, 16% 4px, 18% 0%, 20% 4px, 22% 0%, 24% 4px, 26% 0%, 28% 4px, 30% 0%, 32% 4px, 34% 0%, 36% 4px, 38% 0%, 40% 4px, 42% 0%, 44% 4px, 46% 0%, 48% 4px, 50% 0%, 52% 4px, 54% 0%, 56% 4px, 58% 0%, 60% 4px, 62% 0%, 64% 4px, 66% 0%, 68% 4px, 70% 0%, 72% 4px, 74% 0%, 76% 4px, 78% 0%, 80% 4px, 82% 0%, 84% 4px, 86% 0%, 88% 4px, 90% 0%, 92% 4px, 94% 0%, 96% 4px, 98% 0%, 100% 4px, 100% 100%, 0% 100%)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-data text-[10px] uppercase tracking-widest text-ink-700">
                    Sales Challan
                  </div>
                  <div className="font-data text-sm text-ink-900 font-medium">
                    CH-2026-00184
                  </div>
                </div>
                <div className="font-display text-stamp-green text-xs uppercase tracking-wider border-2 border-stamp-green rounded-sm px-2 py-1 rotate-6">
                  Confirmed
                </div>
              </div>

              <div className="border-t border-line pt-3 space-y-1.5 font-data text-xs text-ink-800">
                <div className="flex justify-between">
                  <span className="text-ink-700">Customer</span>
                  <span>Ramesh Traders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-700">Steel Bolt 8mm × 120</span>
                  <span>SKU-BOLT-8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-700">Paint Bucket 5L × 6</span>
                  <span>SKU-PAINT-5L</span>
                </div>
              </div>

              <div className="border-t border-line mt-3 pt-3 flex justify-between font-data text-xs">
                <span className="text-ink-700">Total qty</span>
                <span className="text-ink-900 font-medium">126 units</span>
              </div>
            </div>
          </div>
        </div>

        <div className="font-data text-line text-[11px] tracking-wide">
          Auth · Customers · Products · Challans
        </div>
      </div>

      {/* Right panel — the actual login form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden font-display text-ink-900 text-xl uppercase tracking-wide mb-1">
              Ledgerline
            </div>
            <h1 className="font-display text-2xl text-ink-900 uppercase tracking-wide">
              Sign in
            </h1>
            <p className="font-data text-xs text-ink-700 mt-1 tracking-wide">
              Internal access only · sales, warehouse, accounts, admin
            </p>
          </div>

          {error && (
            <div className="mb-5 text-sm text-stamp-amber bg-paper-50 border border-stamp-amber/40 rounded-sm px-3 py-2 font-body">
              {error}
            </div>
          )}

          <label className="block font-data text-[11px] uppercase tracking-widest text-ink-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full mb-5 bg-transparent border-0 border-b-2 border-line focus:border-ink-900 outline-none px-0.5 py-2 text-sm font-body text-ink-900 transition-colors"
            required
          />

          <label className="block font-data text-[11px] uppercase tracking-widest text-ink-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mb-8 bg-transparent border-0 border-b-2 border-line focus:border-ink-900 outline-none px-0.5 py-2 text-sm font-body text-ink-900 transition-colors"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-900 hover:bg-ink-800 text-paper-50 font-display uppercase tracking-wide text-sm rounded-sm py-3 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
