"use server"

import { supabaseLogin } from "@/lib/api/supabase";

export default async function LoginUser(username: string, apiKey: string) {
    return await supabaseLogin(username, apiKey)
}
