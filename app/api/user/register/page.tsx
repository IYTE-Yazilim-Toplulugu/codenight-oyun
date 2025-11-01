"use server"

import {MUser} from "@/lib/models/User";
import supabase from "@/lib/api/supabase/supabase";
import {checkApiKey} from "@/lib/util/fal";

export default async function UserRegister(user: MUser){
    const status = await checkApiKey(user.api_key);
    if (!status){
        return {
            message: "API Key was wrong.",
            success: false
        };
    }

    const userToAdd = {
        username: user.username,
        api_key: user.api_key,
        avatar: user.avatar,
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