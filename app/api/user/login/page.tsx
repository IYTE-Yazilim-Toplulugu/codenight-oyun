"use server"

import supabase from "@/lib/api/supabase/supabase";
import {cookies} from "next/headers";

export default async function LoginUser(username: string, apiKey: string){
    const { error, data } = await supabase.from("users")
        .select("id", {
            count: "exact",
            head: true
        }).eq("username", username).eq("api_key", apiKey);

    if (error){
        return {
            success: false,
            message: error.message
        };
    }

    const cks = await cookies();

    cks.set('apiKey', apiKey);

    return {
        success: true,
        message: "OK"
    };
}