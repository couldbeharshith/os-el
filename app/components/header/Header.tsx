"use client"

import { ModeToggle } from "./ModeToggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

const routes = {
  "/": {
    name: "Home",
    path: "/",
  },
  "/dashboard": {
    name: "Dashboard",
    path: "/dashboard",
  },
  "/analytics": {
    name: "Analytics",
    path: "/analytics",
  },
  "/pagetable": {
    name: "Page Table",
    path: "/pagetable",
  },
  "/hierarchy": {
    name: "Memory Hierarchy",
    path: "/hierarchy",
  },


}

export function Header({ 
  action 
}: { 
  action?: React.ReactNode 
}) {
  const pathname = usePathname()
  
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const items = []
    
    // Always add home
    items.push(
      <BreadcrumbItem key="home">
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
    )

    if (segments.length > 0) {
      items.push(<BreadcrumbSeparator key="home-separator" />)
      
      // Add current page
      const currentPath = `/${segments[0]}`
      const route = routes[currentPath as keyof typeof routes]
      
      if (route) {
        items.push(
          <BreadcrumbItem key={currentPath}>
            <BreadcrumbPage>{route.name}</BreadcrumbPage>
          </BreadcrumbItem>
        )
      }
    }

    return items
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbs()}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-4">
          {action}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}