"use server"

import {getUserIdFromCookie} from "@/lib/util/auth";

export default async function GetUserID(){
    return await getUserIdFromCookie();
}