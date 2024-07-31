import { PlayerType } from "./data/Types";
import { API_URL } from "./apiURLs";

const URL = `${API_URL}/players`;
const SEARCH_API = `${API_URL}/search?name`;

export async function fetchPlayers(): Promise<PlayerType[]> {
  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error("failed to fetch players");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPlayer(id: string) {
  try {
    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) {
      throw new Error("failed to get player");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function updatePlayer(id: string) {
  try {
    const res = await fetch(`${URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify(updateData),  if update data in frontend,
      // but data it is executed from website
    });
    if (!res.ok) throw new Error("not found player");

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function deletePlayer(id: string) {
  try {
    const response = await fetch(`${URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "applications/json",
      },
    });
    if (!response.ok) {
      throw new Error("failed to delete Player");
    }
    await fetchPlayers();
  } catch (error) {
    console.error(error);
  }
}

export async function searchPlayers(name: string) {
  try {
    const response = await fetch(`${SEARCH_API}=${name}`);
    if (!response.ok) {
      throw new Error("Failed to fetch player");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
