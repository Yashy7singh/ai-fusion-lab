"use client";

import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './_components/AppSidebar'
import { TooltipProvider } from "@/components/ui/tooltip"
import AppHeader from './_components/AppHeader'
import { useUser } from '@clerk/nextjs'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { setDoc } from 'firebase/firestore'
    

function Provider({children, ...props}) {
  const {user} = useUser();

  React.useEffect(() => {
    if(user){
      CreateNewUser();
    }
  }, [user]);

  const CreateNewUser = async () => {
    const userRef = doc(db, 'users', user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress);
    const userSnap = await  getDoc(userRef);

    if (userSnap.exists()) {
      console.log('User document already exists');
      return;
    }
    else{
      const userData = {
        name  : user?.fullName || 'Anonymous',
        email : user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress,
        createdAt: new Date(),
        remainingMsg: 5,
        plan: 'free',
        credits:1000
    }
    await setDoc(userRef, userData);
    console.log('New user document created');
  }
}

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