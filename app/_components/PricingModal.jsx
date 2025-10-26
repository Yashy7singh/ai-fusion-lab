import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PricingTable } from "@clerk/nextjs"

import React from 'react'

// app\_components\PricingModal.jsx
function PricingModal({children}) {
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <div className="w-full">{children}</div>
      </DialogTrigger>
      <DialogContent className={"w-full max-w-4xl"}>
        <DialogHeader>
          <DialogTitle>Upgrade Plan</DialogTitle>
          {/* Keep a simple text description here */}
          <DialogDescription>
            Choose the plan that best fits your needs.
          </DialogDescription>
        </DialogHeader>
        {/* Place the main content (PricingTable) here, after the header */}
        <PricingTable/>
      </DialogContent>
    </Dialog>
  )
}

export default PricingModal