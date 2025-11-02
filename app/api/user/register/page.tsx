"use server"

import { MUser } from "@/lib/models/User";
import supabase from "@/lib/api/supabase/supabase";
import { checkApiKey } from "@/lib/util/fal";
import { randomInt } from "node:crypto";
import LoginUser from "../login/page";

export default async function UserRegister(user: Omit<MUser, "is_admin" | "admin_pass" | "id" | "avatar">) {
    const status = await checkApiKey(user.api_key);
    if (!status) {
        return {
            message: "API Key was wrong.",
            success: false,
            user: null
        };
    }

    const userToAdd = {
        ...user,
        avatar: randomInt(30) || 1,
        is_admin: false
    };

    const { data, error } = await supabase
        .from("users")
        .insert(userToAdd)
        .select();

    if (error?.code == "23505") {
        return LoginUser(user.username, user.api_key);
    }

    return {
        success: !error,
        message: error ? error.message : "OK",
        user: data ? data[0] : null
    };
}
