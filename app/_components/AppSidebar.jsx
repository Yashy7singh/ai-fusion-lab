"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import React from "react"
import { Sun, Moon, User2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SignInButton, useUser } from "@clerk/nextjs";
import UsageCreditProgress from "./UsageCreditProgress";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useEffect } from "react";
import moment from "moment";

export function AppSidebar() {
    const {theme, setTheme} = useTheme();
    const {user}  = useUser();
    const [chatHistory, setChatHistory] = React.useState([]); 
    useEffect(() => {
      user && GetChatHistory();
    }, [user]);


    const GetChatHistory = async () => {
        // Implement your fetch chat history logic here
        const q = query(collection(db, "chatHistory"), where("userEmail", "==", user?.primaryEmailAddress?.emailAddress));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          console.log(doc.id, doc.data());
          setChatHistory(prev => [...prev, doc.data()]);
        });
    }

    const GetLastUserMessageFromChat = (chat) => {
      const allMessages = Object.values(chat.messages).flat();
      const userMessages = allMessages.filter(msg => msg.role === 'user');

      const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : "No messages";
      const lastUpdated = chat.lastUpdated || Date.now();
      const formattedDate = moment(lastUpdated).fromNow();
      return {
        chatId : chat.chatId,
        message: lastUserMessage,
        lastMsgDate: formattedDate
      }
    }

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
           <Link href={'/'}>
            <Button className={'mt-7 w-full'} size={"lg"}>+ New Chat</Button>
           </Link> :
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

                {chatHistory.map((chat) => (
                  <Link href={'?chatId='+ chat.chatId} key={chat.chatId} className="mt-2">
                    <div className=" hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
                    <h2 className="text-sm text-gray-500">{GetLastUserMessageFromChat(chat).lastMsgDate}</h2>
                    <h2 className="text-lg line-clamp-1">{GetLastUserMessageFromChat(chat).message}</h2>
                    </div>
                    <hr className="my-3"/>     
                  </Link>))}
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