
//const BASE_URL = 'https://bjorli.dypnet.no/api';  // Change this if your server is hosted elsewhere
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getPlaceholderGame = async (): Promise<BjorliGame> => {
    const response = await fetch(`${BASE_URL}/date/`);
    return await response.json();
}

export const getDateData = async (date: string): Promise<BjorliGame> => {
    const response = await fetch(`${BASE_URL}/date/${date}`);
    return await response.json();
}

export const getDates = async (): Promise<string[]> => {
    const response = await fetch(`${BASE_URL}/dates`);
    return await response.json();
}

export const sendGame = async (game: BjorliGame) => {
    const response = await fetch(`${BASE_URL}/game`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(game),
    });
    return await response.json();
}

export const lockGame = async (date: string): Promise<{status: string, message: string}> => {
    const response = await fetch(`${BASE_URL}/lock/${date}`, {
        method: 'POST',
    });
    return await response.json();
}

// Type definitions
export interface Game {
    name: string;
    scores: Record<string, number>;
}

export interface BjorliGame {
    date: string;
    locked: boolean;
    games: Game[];
    players: string[];
}
