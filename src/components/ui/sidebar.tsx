"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  isCollapsed: boolean
  isMobile: boolean
  activeItem?: string
  setActiveItem?: (id: string) => void
}>({
  isCollapsed: false,
  isMobile: false,
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

  React.useEffect(() => {
    setIsCollapsed(isMobile)
  }, [isMobile])

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobile, }}>
        <TooltipProvider delayDuration={0}>
            {children}
        </TooltipProvider>
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "flex h-full flex-col bg-sidebar transition-all duration-300 ease-in-out",
  {
    variants: {
      isCollapsed: {
        true: "w-14",
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
  return (
    <div
      className={cn("flex h-16 shrink-0 items-center gap-2 border-b px-4", className)}
    >
      {children}
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
  return (
    <div className={cn("mt-auto border-t p-4", className)}>
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
  "flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
  {
    variants: {
      isActive: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground",
        false: "text-sidebar-foreground hover:bg-sidebar-accent/50",
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
    
    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(sidebarMenuButtonVariants({ isActive, isCollapsed }), className)}
                        {...props}
                    >
                        {children}
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
            {children}
        </Button>
    )
}

export function SidebarInset({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()
  return (
    <main
      className={cn("transition-all duration-300 ease-in-out md:pl-14",
      !isCollapsed && "md:pl-64", 
      className)}
    >
      {children}
    </main>
  )
}

export function SidebarTrigger({
  className,
  children,
  ...props
}: ButtonProps) {
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
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar className="flex w-full border-r-0">
          <SidebarHeader>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-primary"
                    >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                        <path d="M12 22V12" />
                    </svg>
                </Button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold tracking-tight">Citadel Guard</h2>
                </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <KeyRound className="h-5 w-5" />
                        <span>Passwords</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SheetContent>
    </Sheet>
  )
}
