import React from 'react'
import AiModelList from '@/shared/AiModelList'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { AiSelectedModelContext } from '@/context/AiSelectedModelContext'
import { SelectGroup, SelectLabel } from '@radix-ui/react-select'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth, useUser } from '@clerk/nextjs'
import { db } from '@/config/FirebaseConfig'
import { setDoc } from 'firebase/firestore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function AiMultiModels() {
    const {user} = useUser();
    const [aiModelList, setAiModelList] = React.useState(AiModelList);
    const {aiSelectedModels, setAiSelectedModels,messages, setMessages} = React.useContext(AiSelectedModelContext);
    const plan = user?.publicMetadata?.plan;

    const onToggleChange = (model,value)=>{
        setAiModelList((prev)=>
            prev.map((m)=>
                m.model === model ? {...m, enable: value} : m
            ))
        
        setAiSelectedModels((prev)=>({
            ...prev,
            [model]: { 
                ...(prev?.[model]??{})
                , enable: value
            }
        }))
    }

    console.log("aiSelectedModels in multi models:",aiSelectedModels);

    const onSelectValue = async (model, value) => {
      if (!user?.id) return; // optionally show a toast
      const next = {
        ...aiSelectedModels,
        [model]: { modelId: value },
      };
      setAiSelectedModels(next);
      try {
        const docRef = doc(db, "users", user.id);
        await setDoc(docRef, { selectedModelPref: next }, { merge: true });
      } catch (e) {
        console.error("Failed to persist model selection", e);
      }
    }

  return (
    <div className='flex flex-1 h-[75vh] border-b'>
        {aiModelList.map((model,index)=>(
            <div key={index} className={`flex flex-col border-r h-full overflow-auto
            ${model.enable ? 'flex-1 min-w-[400px]' : 'w-[100px] flex-none'}
            `}>
        
                <div className='flex w-full items-center h-[70px] justify-between border-b p-4'>
                    <div className='flex items-center gap-4'>
                        <Image src={model.icon} alt={model.model} width={24} height={24} />

                  {plan !== 'unlimited_plan'  && model.enable &&  (<Select value={aiSelectedModels[model.model]?.modelId} 
                  onValueChange={(value)=>onSelectValue(model.model, value)}
                  disabled={model.premium}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={aiSelectedModels[model.model]?.modelId} />
                        </SelectTrigger>       
                        <SelectContent>
                            <SelectGroup className='px-3'>
                                <SelectLabel>Free</SelectLabel>
                                
                                {model.subModel && model.subModel.map((subModel, subIndex) => subModel.premium===false && (
                                    <SelectItem key={subIndex} value={subModel.id}>{subModel.name}</SelectItem>
                                ))}
                            </SelectGroup>

                            <SelectGroup className='px-3'>
                                <SelectLabel>Premium</SelectLabel>
                                {model.subModel && model.subModel.map((subModel, subIndex) => subModel.premium===true && (
                                    <SelectItem key={subIndex} value={subModel.name} disabled={subModel.premium}>
                                        {subModel.name} {subModel.premium && <Lock className='inline-block ml-1 h-3 w-3'/>}    
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>)
                    }
                    </div>

                    <div>
                       {model.enable ? 
                       <Switch checked={model.enable}
                            disabled = {plan !== 'unlimited_plan'  && model.premium}
                            onCheckedChange={(checked) => onToggleChange(model.model,checked)}
                        />:
                        <Button variant="ghost" size="icon" onClick={()=> onToggleChange(model.model,true)}>
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                       }
                    </div>
                </div>  
            {plan !== 'unlimited_plan'&& model.premium && model.enable && <div className='flex justify-center items-center h-full'> 
                    <Button>
                        <Lock/>
                        Upgrade to Unlock Premium Models
                    </Button>
                </div> }

                {model.enable && aiSelectedModels[model.model]?.enable && (!model.premium || plan !== 'unlimited_plan')&& 
                <div className='flex-1 p-4'>
                    <div className='flex-1 p-4 space-y-2'>
                     {messages[model.model] && messages[model.model].map((msg, msgIndex) => (
                        <div key={msgIndex} className={`p-4 border-b ${msg.role === 'user' ? 'bg-gray-400 border rounded-2xl text-black text-right' : 'bg-blue-300 border rounded-2xl text-blue-800 text-left'}`}>
                            {msg.role === 'assistant' && (
                                <span className='text-sm text-blue-900'>{msg.model??model.model}</span>
                            )}
                            <div className='flex items-center gap-3'>
                            {msg.content === 'loading' && <><Loader2 className='animate-spin'/><span>Generating response...</span></>}
                            </div>
                            {msg?.content !== 'loading' && 
                              msg?.content &&<ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>}
                        </div>
                     ))}
                    </div>
                </div>
            }
            </div>
    

            ))}    

            
    </div>
  )
}

export default AiMultiModels