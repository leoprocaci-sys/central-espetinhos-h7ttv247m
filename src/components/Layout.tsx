import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Beef,
  Users,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { SkewerIcon } from '@/components/SkewerIcon'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Produtos', path: '/produtos', icon: Beef },
    { label: 'Clientes', path: '/clientes', icon: Users },
    { label: 'Pedidos', path: '/pedidos', icon: ShoppingBag },
  ]

  const isNavActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#F6F3EF] flex flex-col lg:flex-row text-[#2A2420]">
      {/* Mobile Topbar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E7E1DA] px-4 h-14 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FCE9E4] flex items-center justify-center">
            <SkewerIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-[#2A2420] tracking-tight">
              Central Espetinhos
            </span>
            <span className="text-[10px] block text-[#7A716A] -mt-1 font-medium">Gestão B2B</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-[#2A2420] hover:bg-[#F6F3EF] rounded-lg transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-[#2A2420]/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-[#E7E1DA] flex flex-col justify-between p-5 z-50 animate-slide-in-right">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E7E1DA]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FCE9E4] flex items-center justify-center">
                    <SkewerIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-bold text-base text-[#2A2420]">Central Espetinhos</h1>
                    <p className="text-xs text-[#7A716A]">Operação & Distribuição</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#7A716A] hover:text-[#2A2420] hover:bg-[#F6F3EF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="mt-6 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isNavActive(item.path)
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-[#FCE9E4] text-[#C43A25] font-semibold border-l-4 border-[#C43A25]'
                          : 'text-[#2A2420] hover:bg-[#FAF8F5]',
                      )}
                    >
                      <Icon
                        className={cn('w-5 h-5', active ? 'text-[#C43A25]' : 'text-[#7A716A]')}
                      />
                      {item.label}
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            {/* Mobile User Block & Logout */}
            <div className="pt-4 border-t border-[#E7E1DA]">
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex flex-col truncate pr-2">
                  <span className="text-sm font-semibold text-[#2A2420] truncate">
                    {user?.name || 'Administrador'}
                  </span>
                  <span className="text-xs text-[#7A716A] truncate">
                    {user?.email || 'leoprocaci@gmail.com'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sair do sistema"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C43A25] bg-[#FCE9E4] hover:bg-[#fbd3ca] rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (Fixed Left, 240px) */}
      <aside className="hidden lg:flex flex-col justify-between w-60 shrink-0 min-h-screen bg-white border-r border-[#E7E1DA] sticky top-0 h-screen p-5">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#E7E1DA]">
            <div className="w-10 h-10 rounded-xl bg-[#FCE9E4] flex items-center justify-center shrink-0 shadow-2xs">
              <SkewerIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight text-[#2A2420]">
                Central Espetinhos
              </h1>
              <p className="text-[11px] font-medium text-[#7A716A] uppercase tracking-wider">
                Gestão B2B
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="mt-6 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isNavActive(item.path)
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                    active
                      ? 'bg-[#FCE9E4] text-[#C43A25] font-semibold border-l-4 border-[#C43A25]'
                      : 'text-[#2A2420] hover:bg-[#FAF8F5] hover:text-[#C43A25]',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      active ? 'text-[#C43A25]' : 'text-[#7A716A] group-hover:text-[#C43A25]',
                    )}
                  />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User Block & Logout (bottom) */}
        <div className="pt-4 border-t border-[#E7E1DA]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-[#2A2420] truncate">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-[11px] text-[#7A716A] truncate">
                {user?.email || 'leoprocaci@gmail.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#C43A25] bg-[#FCE9E4] hover:bg-[#f9d7cf] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] w-full mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
