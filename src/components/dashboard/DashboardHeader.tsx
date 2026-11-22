
type DashboardHeaderProps = {
  title: string;
  description: string;
  userName: string;
};

export function DashboardHeader({
  title,
  description,
  userName,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-black px-8 py-5">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 font-semibold text-white">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            {userName}
          </p>

          <p className="text-xs text-zinc-500">
            Landlord
          </p>
        </div>
      </div>
    </header>
  );
}
