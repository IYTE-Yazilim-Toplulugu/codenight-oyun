import supabase from "@/lib/api/supabase/supabase";
import {cookies} from "next/headers";

export async function getUserIdByApiKey(apiKey: string){
    const { error, data } = await supabase
        .from("users")
        .select("id").eq("api_key", apiKey).single();

    if (error){
        return {
            success: false,
            message: error.message,
            userId: null
        };
    }

    return {
        success: true,
        message: "OK",
        userId: data.id,
    };
}

export async function getUserIdFromCookie(){
    const cks = await cookies();
    if (!cks.has("apiKey"))
        return false;

    const apiKey = cks.get("apiKey")!.value;

    const { userId } = await getUserIdByApiKey(apiKey);

    return userId;
}