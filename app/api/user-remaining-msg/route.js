// import { currentUser } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import { aj } from "@/config/Arcjet";
// export async function POST(req) {
//     const user = await currentUser();
//     const {token} = await req.json();
//     if(token){
//         const decision = await aj.protect(req, {
//             userId: user?.primaryEmailAddress?.emailAddress ?? "anonymous",
//             requested: token,
//             });
//         if (!decision.isDenied()) {
//             return NextResponse.json({
//                 error: "User has sufficient remaining messages.",
//                 remainingMsg: decision.reason.remaining,
//             });
//         }
//         return NextResponse.json({allowed: true, remainingMsg: decision.reason.remaining});
//     } else {
//         const decision = await aj.protect(req, {
//           userId: user?.primaryEmailAddress?.emailAddress ?? "anonymous",
//           requested: token,
//         });
//     console.log("User Remaining Msg Decision:", decision.reason.remaining);

//     const remainingMsg = decision.reason.remaining;
//     return NextResponse.json({remainingMsg:remainingMsg}); 
//     }
// }


import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { aj } from "@/config/Arcjet";

export async function POST(req) {
    try {
        const user = await currentUser();
        // 1. Safely determine userId, which is necessary for the Arcjet call.
        const userId = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? "anonymous";
        
        // 2. Safely read the body only once.
        let token = null;
        try {
            const body = await req.json();
            token = body.token;
        } catch (e) {
            // Body might be empty or invalid JSON, which is fine if 'token' is optional.
            token = undefined;
        }

        const options = { userId };
         if (token != null) options.requested = token;
        const decision = await aj.protect(req, options);
        // 4. Log the result for server-side debugging (helps catch issues)
        console.log("User Remaining Msg Decision:", decision.reason.remaining ?? null);

        // 5. Handle the result based on the 'token' presence and Arcjet decision.
        const remainingMsg = decision.reason.remaining;
        
        // The original logic seems to imply that if a 'token' is present, 
        // a denial is *good* (meaning the user has sufficient messages).
        if (token) {
            if (!decision.isDenied()) {
                // If not denied, it means the request was ALLOWED (perhaps to spend the token/message).
                // The 'remainingMsg' is the new count after the operation.
                return NextResponse.json({
                    // This message seems reversed for a denial. Let's assume you meant the opposite:
                    // If it's NOT denied, it was successful and the user is 'allowed'
                    allowed: true, 
                    remainingMsg: remainingMsg,
                });
            } else {
                // If denied, the reason usually holds the limit.
                return NextResponse.json({
                    error: "Request denied by Arcjet (Rate limit/Token issue).",
                    remainingMsg: remainingMsg,
                }, { status: 429 }); // Use 429 for rate limit/denial
            }
        } 
        
        // Default case: No token was provided, simply return the current count.
        return NextResponse.json({remainingMsg: remainingMsg});

    } catch (error) {
        // 6. **CRITICAL FIX for 500 Error:** Catch any server-side exceptions.
        console.error("API Route /api/user-remaining-msg FAILED:", error);
        return new NextResponse("Internal Server Error", { status: 500 }); 
    }
}