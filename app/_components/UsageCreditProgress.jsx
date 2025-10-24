import { Progress } from '@/components/ui/progress'
import React from 'react'

function UsageCreditProgress({remaining}) {
  return (
    <div className='p-3 border rounded-2xl mb-5 flex flex-col gap-2'>
        <h2 className='font-bold text-xl'>Free Plan</h2>
        <p className='text-gray-400'>Usage Credits: {5-remaining}/5</p>
        <Progress value={100-((5-remaining) / 5) * 100} max={100} />
    </div>
  )
}

export default UsageCreditProgress