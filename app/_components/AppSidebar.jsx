"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Sun, Moon, User2, Zap } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SignInButton, useUser } from "@clerk/nextjs";
import UsageCreditProgress from "./UsageCreditProgress";

export function AppSidebar() {
    const {theme, setTheme} = useTheme();
    const {user}  = useUser();
  return (
    <Sidebar>
      <SidebarHeader >
        <div className="p-3 ">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={60}
                    height={60}

                    className='w-[40px] h-[40px]'
                    />
                    <h2 className="font-bold text-xl">Ai Fusion</h2>
                </div>

                <div>
                    {theme=='light'?<Button variant={'ghost'} onClick={() => setTheme("dark")}  >
                        <Sun/>
                    </Button>:<Button variant={'ghost'} onClick={() => setTheme("light")}>
                        <Moon/>
                    </Button>}
                </div>
            </div>
          {user ?
            <Button className={'mt-7 w-full'} size={"lg"}>+ New Chat</Button>:
            <SignInButton>
              <Button className={'mt-7 w-full'} size={"lg"}>Sign In to start</Button>
            </SignInButton>
          }
        </div>
        </SidebarHeader>
      <SidebarContent>
        <SidebarGroup >
            <div className={'p-3'}>
                <h2 className="font-bold text-lg">Chats</h2>
                {!user && <p className="text-sm text-gray-400">Sign-in to start chat with multiple ai model</p>}
            </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter >
        <div className="p-3 mb-10">
          {!user ? <SignInButton mode="modal">
            <Button className={'w-full'} size={'lg'}>Sign In/Sign Up</Button>
            </SignInButton> : 
            <div>
              <UsageCreditProgress/>
              <Button className={'w-full mb-3'}><Zap/> Upgrade Plan</Button>
            <Button className="flex" variant={'ghost'}>
              <User2/> <h2>Settings</h2>
              </Button>
            </div>} 
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}