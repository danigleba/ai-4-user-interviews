import { NextResponse } from "next/server"
import supabaseAdmin from "@/utils/supabaseAdmin"

export async function POST(req) {
    const { userId } = await req.json()

    try {
        const { data, error } = await supabaseAdmin
            .from("calls")
            .select("*")
            .eq("user", userId)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true, data: data })
    } catch (error) {
        console.error("Error fetching user posts:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
