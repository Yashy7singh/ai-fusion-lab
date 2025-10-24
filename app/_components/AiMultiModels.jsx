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
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { AiSelectedModelContext } from '@/context/AiSelectedModelContext'
import { SelectGroup, SelectLabel } from '@radix-ui/react-select'
import { doc, updateDoc } from 'firebase/firestore'
import { useUser } from '@clerk/nextjs'
import { db } from '@/config/FirebaseConfig'

function AiMultiModels() {
    const {user} = useUser();
    const [aiModelList, setAiModelList] = React.useState(AiModelList);
    const {aiSelectedModels, setAiSelectedModels} = React.useContext(AiSelectedModelContext);

    const onToggleChange = (model,value)=>{
        setAiModelList((prev)=>
            prev.map((m)=>
                m.model === model ? {...m, enable: value} : m
            ))
    }

    const onSelectValue = async (model, value)=>{
        setAiSelectedModels((prev)=>({
            ...prev,
            [model]: {
                modelId: value
            }
        }))

        const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);
        await updateDoc(docRef, {
            selectedModelPref : aiSelectedModels
        });
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

                  {model.enable &&  (<Select defaultValue={aiSelectedModels[model.model]?.modelId} 
                  onValueChange={(value)=>onSelectValue(model.model, value)}
                  disabled={model.premium}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={aiSelectedModels[model.model]?.modelId} />
                        </SelectTrigger>       
                        <SelectContent>
                            <SelectGroup className='px-3'>
                                <SelectLabel>Free</SelectLabel>
                                {model.subModel && model.subModel.map((subModel, subIndex) => subModel.premium==false && (
                                    <SelectItem key={subIndex} value={subModel.id}>{subModel.name}</SelectItem>
                                ))}
                            </SelectGroup>

                            <SelectGroup className='px-3'>
                                <SelectLabel>Premium</SelectLabel>
                                {model.subModel && model.subModel.map((subModel, subIndex) => subModel.premium==true && (
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
                       {model.enable ? <Switch checked={model.enable}
                            onCheckedChange={(checked) => onToggleChange(model.model,checked)}
                        />:
                        <Button variant="ghost" size="icon" onClick={()=> onToggleChange(model.model,true)}>
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                       }
                    </div>
                </div>  
                {model.premium && model.enable && <div className='flex justify-center items-center h-full'> 
                    <Button>
                        <Lock/>
                        Upgrade to Unlock Premium Models
                    </Button>
                </div> }
            </div>
            ))}    

            
    </div>
  )
}

export default AiMultiModels