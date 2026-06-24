import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/claims/new', label: 'New Claim Wizard' },
  { to: '/claims', label: 'Claims Search' },
  { to: '/investigations', label: 'Investigations' }
];

export const Sidebar = () => {
  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <h1 className="mb-4 text-lg font-semibold">WCIMS</h1>
      <nav className="grid gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
