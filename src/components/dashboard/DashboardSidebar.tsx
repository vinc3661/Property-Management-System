
type DashboardSidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
  role: "landlord" | "caretaker";
};

const navigationItems = [
  { id: "overview", label: "Overview" },
{ id: "search", label: "Search"},
  { id: "properties", label: "Properties" },
  { id: "tenants", label: "Tenants" },
  { id: "payments", label: "Payments" },
  { id: "caretakers", label: "Caretakers", landlordOnly: true },
];

export function DashboardSidebar({
  activePage,
  onNavigate,
  onSignOut,
  role,
}: DashboardSidebarProps) {
  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.landlordOnly || role === "landlord"
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-black px-5 py-6">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-white">
          Property<span className="text-emerald-500">Hub</span>
        </h1>

        <p className="mt-1 text-xs text-zinc-500">
          Property Management
        </p>
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Workspace
      </p>

      <nav className="flex-1 space-y-2">
        {visibleNavigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activePage === item.id
                ? "border-l-2 border-emerald-500 bg-zinc-900 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-zinc-800 pt-4">
        <button
          onClick={onSignOut}
          className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-red-400"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
