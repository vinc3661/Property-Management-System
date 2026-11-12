
type DashboardSidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
};

const navigationItems = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "properties", label: "Properties", icon: "▦" },
  { id: "tenants", label: "Tenants", icon: "♙" },
  { id: "caretakers", label: "Caretakers", icon: "♧" },
  { id: "maintenance", label: "Maintenance", icon: "⚒" },
];

export function DashboardSidebar({
  activePage,
  onNavigate,
  onSignOut,
}: DashboardSidebarProps) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white px-5 py-6">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-gray-900">
          Property<span className="text-blue-600">Hub</span>
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          Property Management
        </p>
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Workspace
      </p>

      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
              activePage === item.id
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <span className="text-lg">↪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
