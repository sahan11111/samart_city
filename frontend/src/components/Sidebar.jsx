/**
 * Sidebar navigation component with role-based menu items.
 */
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const icons = {
  dashboard: '🏙️',
  traffic: '🚦',
  waste: '♻️',
  energy: '⚡',
  alerts: '🔔',
  analytics: '📊',
  settings: '⚙️',
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth()

  const menuItems = [
    { label: 'Dashboard', path: isAdmin ? '/admin' : '/citizen', icon: icons.dashboard },
    { label: 'Traffic', path: '/traffic', icon: icons.traffic },
    { label: 'Waste Management', path: '/waste', icon: icons.waste },
    { label: 'Energy', path: '/energy', icon: icons.energy },
    { label: 'Alerts', path: '/alerts', icon: icons.alerts },
    ...(isAdmin ? [{ label: 'Analytics', path: '/analytics', icon: icons.analytics }] : []),
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 w-64 bg-slate-900 dark:bg-slate-950
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center text-xl">
              🏙️
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">Smart City</h1>
              <p className="text-slate-400 text-xs">Dashboard v1.0</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium truncate max-w-[140px]">{user?.username}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${isAdmin
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isAdmin ? '👑 Admin' : '👤 Citizen'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}