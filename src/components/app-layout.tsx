
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Inbox,
  Hourglass,
  Book,
  Archive,
  LogOut,
  FolderKanban,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const navItems = [
  { href: '/', label: 'Actionable', icon: LayoutDashboard },
  { href: '/entry', label: 'Entry', icon: Inbox },
  { href: '/incubate', label: 'Incubate', icon: Hourglass },
  { href: '/project', label: 'Project', icon: FolderKanban },
  { href: '/reference', label: 'Reference', icon: Book },
  { href: '/archive', label: 'Archive', icon: Archive },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function Nav() {
    const pathname = usePathname();
    const { setOpenMobile, isMobile } = useSidebar();
    const { user } = useAuth();
    
    if (!user) return null;

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    }

    return (
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} onClick={handleLinkClick}>
                    <SidebarMenuButton
                    tooltip={item.label}
                    isActive={pathname === item.href}
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )
}

function Profile() {
    const { user, signOut } = useAuth();

    if (!user) {
        return null;
    }
    
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    return (
        <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <Profile />
            </SidebarHeader>
            <SidebarContent>
                <Nav />
            </SidebarContent>
            <SidebarFooter>
            {/* Footer content if any */}
            </SidebarFooter>
        </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
