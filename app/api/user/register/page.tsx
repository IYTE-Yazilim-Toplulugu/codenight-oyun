"use server"

import {MUser} from "@/lib/models/User";
import supabase from "@/lib/api/supabase/supabase";
import {checkApiKey} from "@/lib/util/fal";

export default async function UserRegister(user: Omit<MUser, "is_admin" | "admin_pass" | "id">){
    const status = await checkApiKey(user.api_key);
    if (!status){
        return {
            message: "API Key was wrong.",
            success: false
        };
    }

    const userToAdd = { ...user,
        is_admin: false
    };

    const { error } = await supabase
        .from("users")
        .insert(userToAdd);

    return {
        success: !error,
        message: error ? error.message : "OK"
    };
}