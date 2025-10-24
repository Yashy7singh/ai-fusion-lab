import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { aj } from "@/config/Arcjet";
export async function POST(req) {
    const user = await currentUser();
    const {token} = await req.json();
    if(token){
        const decision = await aj.protect(req, {
            userId: user?.primaryEmailAddress?.emailAddress ?? "anonymous",
            requested: token,
            });
        if (!decision.isDenied()) {
            return NextResponse.json({
                error: "User has sufficient remaining messages.",
                remainingMsg: decision.reason.remaining,
            });
        }
        return NextResponse.json({allowed: true, remainingMsg: decision.reason.remaining});
    } else {
        const decision = await aj.protect(req, {
          userId: user?.primaryEmailAddress?.emailAddress ?? "anonymous",
          requested: token,
        });
    console.log("User Remaining Msg Decision:", decision.reason.remaining);

    const remainingMsg = decision.reason.remaining;
    return NextResponse.json({remainingMsg:remainingMsg}); 
    }
}

