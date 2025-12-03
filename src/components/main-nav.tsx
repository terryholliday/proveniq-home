'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  Archive,
  Box,
  GanttChartSquare,
  HeartHandshake,
  HelpCircle,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

export function MainNav() {
  const pathname = usePathname()
  const [aiSuiteOpen, setAiSuiteOpen] = React.useState(false);
  const [insuranceOpen, setInsuranceOpen] = React.useState(false);

  const isActive = (path: string) => pathname === path

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/dashboard" passHref>
          <SidebarMenuButton asChild isActive={isActive('/dashboard')} tooltip={{ children: 'Dashboard' }}>
            <LayoutGrid />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarGroup>
        <SidebarGroupLabel>Inventory</SidebarGroupLabel>
        <SidebarMenuItem>
          <Link href="/inventory" passHref>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/inventory')} tooltip={{ children: 'My ARK' }}>
              <Archive />
              <span>My ARK</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
           <Link href="/lending" passHref>
            <SidebarMenuButton asChild isActive={isActive('/lending')} tooltip={{ children: 'Lending Tracker' }}>
              <HeartHandshake />
              <span>Lending Tracker</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Services</SidebarGroupLabel>
        <Collapsible asChild open={aiSuiteOpen} onOpenChange={setAiSuiteOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <Sparkles/>
                <span>AI Suite</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
                 <SidebarMenuSub>
                    <SidebarMenuSubItem><SidebarMenuSubButton>AI Scanner</SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton>Space Mapper</SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton>Sales Ad Generator</SidebarMenuSubButton></SidebarMenuSubItem>
                 </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
        <SidebarMenuItem>
          <Link href="/move-planner" passHref>
            <SidebarMenuButton asChild isActive={isActive('/move-planner')} tooltip={{ children: 'Move Planner' }}>
              <Box />
              <span>Move Planner</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'ARKive Auctions' }}>
              <GanttChartSquare />
              <span>ARKive Auctions</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <Collapsible asChild open={insuranceOpen} onOpenChange={setInsuranceOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ShieldCheck/>
                        <span>Insurance</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                     <SidebarMenuSub>
                        <SidebarMenuSubItem><SidebarMenuSubButton>Risk Simulator</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton>Claim Generation</SidebarMenuSubButton></SidebarMenuSubItem>
                     </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
         <SidebarMenuItem>
            <Link href="/legacy-planner" passHref>
              <SidebarMenuButton asChild isActive={isActive('/legacy-planner')} tooltip={{ children: 'Legacy Planner' }}>
                <Wallet />
                <span>Legacy Planner</span>
              </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
      </SidebarGroup>
      
      <SidebarGroup>
        <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarMenuItem>
            <Link href="/user-guide" passHref>
              <SidebarMenuButton asChild isActive={isActive('/user-guide')} tooltip={{ children: 'User Guide' }}>
                <HelpCircle />
                <span>User Guide</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarGroup>

    </SidebarMenu>
  )
}
