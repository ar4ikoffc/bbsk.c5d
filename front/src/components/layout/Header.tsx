import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/authStore'

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Settings className="mr-2 h-4 w-4" />
              Профиль
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}