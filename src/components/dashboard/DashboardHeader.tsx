type DashboardHeaderProps={
    title:string;
    description:string;
    userName:string;
};


export function DashboardHeader({
  title,
  description,
  userName,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            {userName}
          </p>
          <p className="text-xs text-gray-500">
            Landlord
          </p>
        </div>
      </div>
    </header>
  );
}