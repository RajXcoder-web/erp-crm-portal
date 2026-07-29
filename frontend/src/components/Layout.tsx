import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/customers", label: "Customers" },
  { to: "/products", label: "Products" },
  { to: "/challans", label: "Challans" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-4 py-5 text-lg font-semibold border-b border-slate-800">
          ERP + CRM Portal
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-sm">
          <div className="font-medium">{user?.name}</div>
          <div className="text-slate-400">{user?.role}</div>
          <button onClick={logout} className="mt-2 text-brand-100 hover:underline">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-slate-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
