
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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'My Day', icon: LayoutDashboard },
  { href: '/entry', label: 'Entry', icon: Inbox },
  { href: '/incubate', label: 'Incubate', icon: Hourglass },
  { href: '/reference', label: 'Reference', icon: Book },
  { href: '/archive', label: 'Archive', icon: Archive },
];

function Nav() {
    const pathname = usePathname();
    const { setOpenMobile, isMobile } = useSidebar();

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          {/* You can add a logo or header content here */}
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

    