import { NextResponse } from "next/server"
import supabase from "@/utils/supabase"

export async function POST(req) {
    const { email, password } = await req.json()
    try {
        let { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        return NextResponse.json({ data: data })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}