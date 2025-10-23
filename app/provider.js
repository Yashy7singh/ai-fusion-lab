import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './_components/AppSidebar'
import { TooltipProvider } from "@/components/ui/tooltip"
import AppHeader from './_components/AppHeader'

    

function Provider({children, ...props}) {
  return (
    <TooltipProvider>
      <NextThemesProvider {...props} attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              <AppSidebar />
              
              <div className="w-full flex-1 overflow-auto">
                <AppHeader />
                {children}</div>
            </SidebarProvider>
      </NextThemesProvider>
    </TooltipProvider>
  )
}

export default Provider