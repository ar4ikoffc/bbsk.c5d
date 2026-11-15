import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useState } from 'react'
import { cn } from '@/utils/cn'

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onCollapseToggle={toggleSidebarCollapse}
      />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        )}
      >
        <Header onMenuClick={toggleSidebar} />
        <main className="p-4 lg:p-6" onClick={closeSidebar}>
          <Outlet />
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}