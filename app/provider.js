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
import { AiSelectedModelContext } from '@/context/AiSelectedModelContext';
import { DefaultModel } from '@/shared/AiModelsShared';
import { UserDetailContext } from '@/context/UserDetailContext';
import { updateDoc } from 'firebase/firestore';
    

function Provider({children, ...props}) {
  const {user} = useUser();
  const [aiSelectedModels, setAiSelectedModels] = React.useState(DefaultModel);
  const [userDetail, setUserDetail] = React.useState(null);
  const [messages, setMessages] = React.useState({});

  const CreateNewUser =  React.useCallback(async () => {
    try{
        const userRef = doc(db, 'users', user?.id);
        const userSnap = await  getDoc(userRef);

        if (userSnap.exists()) {
          console.log('User document already exists');
          const userInfo = userSnap.data();
          setAiSelectedModels(userInfo.selectedModelPref ?? DefaultModel);
          setUserDetail(userInfo);
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
        setUserDetail(userData);
        }    
  }
  catch (error) {
        console.error('Error creating user document:', error);
        // Consider showing a user-facing error message or retry logic
    }
}, [user]);

React.useEffect(() => {
    if(user){
      CreateNewUser();
    }
  }, [user,CreateNewUser]);

React.useEffect(() => {
    if(aiSelectedModels){
      updateModelSelection();
    }
}, [aiSelectedModels]);

const updateModelSelection = async () => {
  const docRef = doc(db, "users", user.id);
  await setDoc(docRef, { selectedModelPref: aiSelectedModels }, { merge: true });
};

  return (
    <TooltipProvider>
      <NextThemesProvider {...props} attribute="class" defaultTheme="system" enableSystem >
        <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
        <AiSelectedModelContext.Provider value={{aiSelectedModels, setAiSelectedModels,messages, setMessages}}>
            <SidebarProvider>
              <AppSidebar />
              
              <div className="w-full flex-1 overflow-auto">
                <AppHeader />
                {children}</div>
            </SidebarProvider>
          </AiSelectedModelContext.Provider>
        </UserDetailContext.Provider>
      </NextThemesProvider>
    </TooltipProvider>
  )
}

export default Provider