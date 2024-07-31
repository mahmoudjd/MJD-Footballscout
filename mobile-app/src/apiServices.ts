import { API_URL } from "./apiURLs";

const URL = `${API_URL}/players`;

const API_URL2 = `${API_URL}/search?name=`;

export async function getAllPlayers() {
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error("Failed to fetch players");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function searchPlayers(name: string) {
  try {
    const response = await fetch(`${API_URL2}${name}`);
    if (!response.ok) {
      throw new Error("Failed to fetch player");
    }
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function fetchPlayer(id: string) {
  try {
    const res = await fetch(`${URL}/${id}`);
    if (!res.ok) {
      throw new Error("not found player");
    }
    const data = await res.json();

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
    });
    if (!res.ok) throw new Error("failed to update player");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function deletePlayer(id: string) {
  try {
    const res = await fetch(`${URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("failed to delete player");
  } catch (error) {
    console.error(error);
  }
}
