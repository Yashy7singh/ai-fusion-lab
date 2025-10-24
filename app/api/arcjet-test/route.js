import { NextResponse } from "next/server";
import { aj } from "@/config/Arcjet";

export async function GET(req) {
    const userId = "user_123"; // Replace with actual user ID extraction logic
    const decision = await aj.protect(req, {
        userId, requested:5});
        console.log("Arcjet decision:", decision);

        if(decision.isDenied()){
            return NextResponse.json(
                {error:"Rate limit exceeded", reason: decision.reason}, {status:429}
            );
        }
        return NextResponse.json({message:"Request successful"}); 
}