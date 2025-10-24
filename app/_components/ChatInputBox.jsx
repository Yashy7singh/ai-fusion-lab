import { Button } from '@/components/ui/button'
import { Mic, Paperclip, Send } from 'lucide-react'
import React, { useEffect } from 'react'
import AiMultiModels from './AiMultiModels'
import { AiSelectedModelContext } from '@/context/AiSelectedModelContext'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'
import { doc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { setDoc } from 'firebase/firestore'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { getDoc } from 'firebase/firestore'

function ChatInputBox() {
    const [userInput, setUserInput] = React.useState('');
    const {aiSelectedModels, setAiSelectedModels,messages, setMessages} = React.useContext(AiSelectedModelContext); 
    const [chatId, setChatId] = React.useState(null); // Optional: for tracking chat sessions
    const {user} = useUser();
    
    const params = useSearchParams();

    useEffect(() => {
        // Generate a unique chatId when component mounts
        if(params.get('chatId')){
            setChatId(params.get('chatId'));
            GetMessages(params.get('chatId'));
            return;
        }else{
            setMessages({});
            setChatId(uuidv4());
        }
    }, [params]);

    const handleSend = async () => {
            if (!userInput.trim()) return;

            // 1️⃣ Add user message to all enabled models
            setMessages((prev) => {
                const updated = { ...prev };
                Object.keys(aiSelectedModels).forEach((modelKey) => {
                    if(aiSelectedModels[modelKey].enable){
                        updated[modelKey] = [
                            ...(updated[modelKey] ?? []),
                            { role: "user", content: userInput },
                        ];
                    }
                });
                return updated;
            });

            const currentInput = userInput; // capture before reset
            setUserInput("");

            // 2️⃣ Fetch response from each enabled model Fetch response from each enabled model
            const apiCalls = Object.entries(aiSelectedModels)
                .filter(([parentModel, modelInfo]) => modelInfo.modelId && modelInfo.enable !== false)
                .map(async ([parentModel, modelInfo]) => {

                // Add loading placeholder before API call
                setMessages((prev) => ({
                    ...prev,
                    [parentModel]: [
                        ...(prev[parentModel] ?? []),
                        { role: "assistant", content: "loading", model: parentModel, loading: true },
                    ],
                }));


                try {
                    const result = await axios.post("/api/ai-multi-models", {
                        model: modelInfo.modelId,
                        msg: [{ role: "user", content: currentInput }],
                        parentModel,
                    });

                    const { aiResponse, model } = result.data;

                    // 3️⃣ Add AI response to that model’s messages
                    setMessages((prev) => {
                        const updated = [...(prev[parentModel] ?? [])];
                        const loadingIndex = updated.findIndex((m) => m.loading);

                        if (loadingIndex !== -1) {
                            updated[loadingIndex] = {
                                role: "assistant",
                                content: aiResponse,
                                model,
                                loading: false,
                            };
                        } else {
                            // fallback if no loading msg found
                            updated.push({
                                role: "assistant",
                                content: aiResponse,
                                model,
                                loading: false,
                            });
                        }

                        return { ...prev, [parentModel]: updated };
                    });
                } catch (err) {
                    console.error(err);
                    setMessages((prev) => ({
                        ...prev,
                        [parentModel]: [
                            ...(prev[parentModel] ?? []),
                            { role: "assistant", content: "⚠️ Error fetching response." },
                        ],
                    }));
                }
            });
            await Promise.allSettled(apiCalls);
};
        
useEffect(() => {
        // console.log("Messages updated:", messages);
        if(messages){
            SaveMessages();
        }
    }, [messages]);

    const SaveMessages = async () => {
       const docRef = doc(db, "chatHistory", chatId);

       await setDoc(docRef, {
        chatId: chatId,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        messages: messages,
        lastUpdated: Date.now()
       }, { merge: true });
    }

    const GetMessages = async () => {
        console.log("INSDE", chatId);
        const docRef = doc(db, "chatHistory", chatId);
        const docSnap = await getDoc(docRef);
        console.log("Fetched chat doc:", docSnap.data());
        const docData = docSnap.data();
        setMessages(docData.messages);
    }

  return (
    <div className='relative min-h-screen'>
        {/* Page Content */}
        <div>
            <AiMultiModels/>
        </div>

        {/* Fixed Chat Input */}
        <div className='fixed bottom-0 left-0 w-full  flex justify-center px-4 pb-4'> 
            <div className='w-full border rounded-xl shadow-md max-w-2xl p-4 '>
                <input type="text" placeholder='Ask me Anything...' className='w-full border-0 outline-none'
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)} />

                <div className='mt-3 flex justify-between items-center'>
                    <Button variant={'ghost'} size={'icon'}>
                        <Paperclip className='h-4 w-4' />
                    </Button>

                    <div className='flex gap-5'>
                       <Button variant={'ghost'} size={'icon'}><Mic/></Button>
                       <Button size={'icon'} onClick={handleSend}><Send/></Button>
                    </div>
                </div>
            </div>
        </div>



    </div>
    
  )
}

export default ChatInputBox