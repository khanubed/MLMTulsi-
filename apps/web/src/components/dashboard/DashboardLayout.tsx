import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  User,
  LifeBuoy,
  Gift,
  LogOut,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    { label: "My Orders", path: "/dashboard/orders", icon: Package },
    { label: "Profile Details", path: "/dashboard/profile", icon: User },
    { label: "Support Desk", path: "/dashboard/support", icon: LifeBuoy },
    {
      label: "Referral Demo",
      path: "/dashboard/referrals",
      icon: Gift,
      isReferral: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5ED] py-6 sm:py-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-[#183F32] text-[#F8F5ED] rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#B49A63] font-semibold flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-[#A9B7A0]" />
              Tulsi Swaraj Customer Portal
            </span>
            <h1 className="text-xl sm:text-3xl font-serif font-bold">
              Namaste, {user?.fullName || "Valued Member"}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#A9B7A0]">
              Account: {user?.email} • Member since{" "}
              {user?.registeredDate || "2026"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#285642] hover:bg-red-800 text-[#F8F5ED] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Mobile-First Navigation: Horizontal scroll on mobile, Sidebar on lg */}
        <div className="lg:hidden mb-6 overflow-x-auto no-scrollbar -mx-4 px-4 flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? "bg-[#183F32] text-[#F8F5ED] shadow-xs"
                      : "bg-white text-[#252923] border border-[#E5DFD3] hover:bg-[#EFE9DB]"
                  } ${item.isReferral ? "border-[#B49A63]" : ""}`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-[#E5DFD3] p-4 shadow-xs">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#183F32] text-[#F8F5ED] shadow-xs"
                          : "text-[#252923] hover:bg-[#EFE9DB] hover:text-[#183F32]"
                      } ${item.isReferral ? "border border-[#B49A63]/40" : ""}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          {/* Main Sub-view Outlet */}
          <main className="lg:col-span-9 bg-white rounded-2xl sm:rounded-3xl border border-[#E5DFD3] p-4 sm:p-8 shadow-xs min-h-[450px]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
