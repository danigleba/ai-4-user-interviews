import { NextResponse } from "next/server"
import supabaseAdmin from "@/utils/supabaseAdmin"
import { v4 as uuidv4 } from "uuid"

export async function POST(req) {
    const { transcript, gptResponse, publicUrl } = await req.json()

    try {
        const { data, error } = await supabaseAdmin
            .from("calls")
            .insert([
                {
                    transcript: transcript,
                    analysis: gptResponse,
                    video_url: publicUrl
                }
            ])

        return NextResponse.json({ success: true, data: data })
    } catch (error) {
        console.error("Error saving video analysis:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
