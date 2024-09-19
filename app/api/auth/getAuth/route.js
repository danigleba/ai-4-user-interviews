import { NextResponse } from "next/server"
import supabaseAdmin from "@/utils/supabaseAdmin"

export async function POST(req, res) {
    const { access_token } = await req.json()
    console.log(access_token)
    try {
        let { data: users, error } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("uuid", access_token)
            .single()

        return NextResponse.json({ data: users })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}