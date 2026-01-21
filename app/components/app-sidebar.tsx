"use client"

import { BarChart3, Cpu, Home, Settings, Table, Layers } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import Image from "next/image"
const navItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    isActive: false,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Cpu,
  },
  {
    title: "Page Table",
    url: "/pagetable",
    icon: Table,
  },
  {
    title: "Memory Hierarchy",
    url: "/hierarchy",
    icon: Layers,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      
      <SidebarHeader>
      <div className="px-6 py-4 border-b flex items-center gap-2">
        <Image src="/vmd_logo.png" alt="Logo" width={100} height={100} />
        <h1 className="text-sm font-semibold">Virtual Memory Dashboard</h1>
      </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navItems}
        />
        <NavProjects
          projects={[
            {
              name: "Memory Analysis",
              url: "/analytics",
              icon: BarChart3,
            },
            {
              name: "System Monitor",
              url: "/monitoring",
              icon: Cpu,
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: "Admin",
            email: "admin@system.local",
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 