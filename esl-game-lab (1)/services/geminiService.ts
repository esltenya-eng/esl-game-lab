/**
 * Gemini Service - Frontend Client
 * Calls backend API instead of using Gemini SDK directly
 */

import { SelectionState, Screen2Response, GameDetail } from '../types';

// Get API URL from environment or default to relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const fetchRecommendations = async (
  filters: SelectionState,
  searchQuery?: string,
  language: string = 'en',
  grammarTopic?: string,
  excludedGames: string[] = []
): Promise<Screen2Response> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters,
        searchQuery,
        language,
        grammarTopic,
        excludedGames
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("fetchRecommendations error", error);
    throw error;
  }
};

export const fetchGameDetail = async (
  gameTitle: string,
  filters: SelectionState,
  language: string = 'en'
): Promise<GameDetail> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/game-detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameTitle,
        filters,
        language
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("fetchGameDetail error", error);
    throw error;
  }
};
