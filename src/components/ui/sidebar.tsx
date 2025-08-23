"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { CitadelGuardLogo, GoogleIcon } from "@/components/icons"
import { KeyRound, Bot, Save, Sun, Moon, PanelLeft } from "lucide-react"

type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const SidebarContext = React.createContext<{
  isCollapsed: boolean
  isMobile: boolean
  activeItem?: string
  setActiveItem?: (id: string) => void
  setCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  isMobile: false,
  setCollapsed: () => {},
})

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = React.useState(isMobile)
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted) {
      setIsCollapsed(isMobile)
    }
  }, [isMobile, mounted])

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobile, setCollapsed }}>
        <TooltipProvider delayDuration={0}>
            {children}
        </TooltipProvider>
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "flex h-full flex-col bg-card transition-all duration-300 ease-in-out",
  {
    variants: {
      isCollapsed: {
        true: "w-16",
        false: "w-64",
      },
    },
  }
)

export function Sidebar({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()
  return (
    <aside className={cn(sidebarVariants({ isCollapsed }), "hidden border-r md:flex", className)}>
      {children}
    </aside>
  )
}

export function SidebarHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={cn("flex h-16 shrink-0 items-center gap-2 border-b px-4", isCollapsed && "justify-center px-2", className)}
    >
      {React.Children.toArray(children).map((child, index) => {
        if (React.isValidElement(child) && child.type === "span" && isCollapsed) {
          return null
        }
        return child
      })}
    </div>
  )
}

export function SidebarContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}>
      {children}
    </div>
  )
}

export function SidebarFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar();
  return (
    <div className={cn("mt-auto border-t p-4", isCollapsed && "p-2 justify-center", className)}>
      {children}
    </div>
  )
}

export function SidebarMenu({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <nav className={cn("flex flex-col gap-1 p-2", className)}>
      {children}
    </nav>
  )
}

export function SidebarMenuItem({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full", className)}>{children}</div>
}

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
  {
    variants: {
      isActive: {
        true: "bg-primary text-primary-foreground shadow-sm",
        false: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      isCollapsed: {
        true: "justify-center",
        false: "justify-start",
      }
    },
    defaultVariants: {
      isActive: false,
    },
  }
)

export function SidebarMenuButton({
  className,
  children,
  isActive,
  tooltip,
  ...props
}: ButtonProps & { isActive?: boolean, tooltip?: string }) {
    const { isCollapsed } = useSidebar();
    
    const content = isCollapsed ? <>{React.Children.toArray(children)[0]}</> : children;

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(sidebarMenuButtonVariants({ isActive, isCollapsed }), className)}
                        {...props}
                    >
                        {content}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Button
            variant="ghost"
            className={cn(sidebarMenuButtonVariants({ isActive, isCollapsed }), className)}
            {...props}
        >
            {content}
        </Button>
    )
}

export function SidebarInset({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 flex-col max-h-screen overflow-y-auto bg-muted/30",
        className
      )}
    >
      {children}
    </div>
  )
}

const MobileSidebar = ({ menuItems, activeView, setActiveView }: { menuItems: MenuItem[]; activeView: string; setActiveView: (view: string) => void; }) => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const renderThemeSwitcher = () => {
    if (!mounted) {
      return null;
    }
    return (
      <div className="flex items-center justify-center space-x-2">
        <Sun className="h-5 w-5" />
        <Switch
          id="mobile-theme-switch"
          checked={theme === 'dark'}
          onCheckedChange={toggleTheme}
        />
        <Moon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <SheetContent side="left" className="flex w-64 flex-col p-0">
      <SidebarHeader>
        <CitadelGuardLogo className="h-7 w-7 text-primary" />
        <span className="text-lg font-semibold tracking-tight">Citadel Guard</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
             <SidebarMenuItem key={item.id}>
               <SheetClose asChild>
                <SidebarMenuButton
                  onClick={() => setActiveView(item.id)}
                  isActive={activeView === item.id}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
                </SheetClose>
             </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {renderThemeSwitcher()}
      </SidebarFooter>
    </SheetContent>
  );
}


export function SidebarTrigger({
  className,
  children,
  menuItems,
  activeView,
  setActiveView,
  ...props
}: ButtonProps & { menuItems: MenuItem[], activeView: string, setActiveView: (view: string) => void }) {
  const { isMobile } = useSidebar()

  if (!isMobile) return null

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("shrink-0", className)}
          {...props}
        >
          {children}
        </Button>
      </SheetTrigger>
      <MobileSidebar menuItems={menuItems} activeView={activeView} setActiveView={setActiveView} />
    </Sheet>
  )
}
