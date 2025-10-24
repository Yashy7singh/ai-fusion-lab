import { NextResponse } from "next/server";
import { aj } from "@/config/Arcjet";
import {auth} from "@/clerk/nextjs/server";

export async function GET(req) {
     const { userId } = auth();
     const decision = await aj.protect(req, {
      userId: userId ?? "anonymous",
      requested: 1,
    });
    console.log("Arcjet decision:", decision);

        if (decision.isDenied()) {
          return NextResponse.json(
            { error: "Rate limit exceeded", reason: decision.reason },
            { status: 429 }
          );
        }
        return NextResponse.json({ message: "Request successful" });
}