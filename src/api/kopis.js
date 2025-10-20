import axios from "axios";
import { parseXmlToJson } from "../utils/xmlParser";

const API_BASE_URL = "http://localhost:4000/api";

export const fetchPerformances = async (
  page,
  rows,
  genre = "",
  region = "",
  status = ""
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/performances`, {
      params: {
        stdate: "20250101",
        eddate: "20251231",
        cpage: page,
        rows: rows,
        shcate: genre,
        signgucode: region,
        prfstate: status,
      },
      responseType: "text",
    });

    const jsonData = parseXmlToJson(response.data);
    const db = jsonData?.dbs?.db;
    if (!db) {
      return [];
    } else if (Array.isArray(db)) {
      return db;
    } else {
      return [db];
    }
  } catch (error) {
    console.error("API fetching error:", error);
    return [];
  }
};

export const fetchPerformanceDetail = async (performanceId) => {
  try {
    const url = `${API_BASE_URL}/performance/${performanceId}`;
    const response = await axios.get(url, { responseType: "text" });
    const jsonData = parseXmlToJson(response.data);
    return jsonData?.dbs?.db || null;
  } catch (error) {
    console.error(`Error fetching detail for ${performanceId}:`, error);
    return null;
  }
};

export const fetchFavoritePerformances = async (favoriteIds) => {
  if (!favoriteIds || favoriteIds.length === 0) {
    return [];
  }
  const fetchPromises = favoriteIds.map((id) => fetchPerformanceDetail(id));
  const results = await Promise.all(fetchPromises);
  return results.filter((result) => result !== null);
};
