import { NextResponse } from "next/server"
import supabaseAdmin from "@/utils/supabaseAdmin"

export async function POST(req) {
    const { transcript, gptResponse, publicUrl, userId, callName } = await req.json()

    try {
        const { data, error } = await supabaseAdmin
            .from("calls")
            .insert([
                {
                    transcript: transcript,
                    analysis: gptResponse,
                    video_url: publicUrl,
                    user: userId,
                    name: callName
                }
            ])

        return NextResponse.json({ success: true, data: data })
    } catch (error) {
        console.error("Error saving video analysis:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
