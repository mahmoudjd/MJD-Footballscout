import {env} from "@/env";

export async function updatePlayer(id: string) {
    try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_HOST}/players/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("not found player");

        const data = await res.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}
