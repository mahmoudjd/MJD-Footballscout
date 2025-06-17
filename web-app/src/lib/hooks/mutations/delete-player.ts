import {env} from "@/env";

export async function deletePlayer(id: string) {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_HOST}/players/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete player: ${response.status}`);
        }

        console.log(`Player ${id} deleted.`);
    } catch (error) {
        console.error("Delete error:", error);
    }
}
