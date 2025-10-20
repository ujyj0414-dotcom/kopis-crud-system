import { useState, useEffect } from "react";

// Local Storage에서 사용할 키를 상수로 정의합니다.
const FAVORITES_KEY = "my-favorites";

/**
 * 찜 목록(Favorite) 상태와 관련 로직을 관리하는 커스텀 훅
 * @returns {Array} [favorites, toggleFavorite]
 * - favorites: 찜한 공연 ID 목록 (Set 객체)
 * - toggleFavorite: 특정 공연을 찜 목록에 추가하거나 제거하는 함수
 */
export const useFavorites = () => {
  // 1. 찜 목록 상태를 관리합니다. Set을 사용해 중복 ID를 방지합니다.
  const [favorites, setFavorites] = useState(() => {
    try {
      // 컴포넌트가 처음 로드될 때 Local Storage에서 데이터를 가져와 초기 상태를 설정합니다.
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      // 저장된 데이터가 있으면 JSON으로 파싱하고, 없으면 빈 배열로 시작합니다.
      const initialValue = storedFavorites ? JSON.parse(storedFavorites) : [];
      // 배열을 Set으로 변환하여 초기화합니다.
      return new Set(initialValue);
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
      return new Set(); // 파싱 실패 시 빈 Set으로 초기화
    }
  });

  // 2. favorites 상태가 변경될 때마다 Local Storage에 자동으로 저장합니다.
  useEffect(() => {
    // Set을 배열로 변환한 뒤, JSON 문자열로 변환하여 저장합니다.
    const favoritesArray = Array.from(favorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
  }, [favorites]); // `favorites`가 바뀔 때만 이 함수가 실행됩니다.

  /**
   * 찜 상태를 토글하는 함수 (추가/제거)
   * @param {string} performanceId - 토글할 공연의 ID
   */
  const toggleFavorite = (performanceId) => {
    setFavorites((prevFavorites) => {
      // 3. 기존 찜 목록을 복사하여 새로운 Set을 만듭니다. (불변성 유지)
      const newFavorites = new Set(prevFavorites);

      // 4. 이미 찜 목록에 있는지 확인합니다.
      if (newFavorites.has(performanceId)) {
        // 있으면 제거합니다 (Delete)
        newFavorites.delete(performanceId);
      } else {
        // 없으면 추가합니다 (Create)
        newFavorites.add(performanceId);
      }

      // 5. 새로 만들어진 Set으로 상태를 업데이트합니다.
      return newFavorites;
    });
  };

  // 6. 현재 찜 목록(Set)과 토글 함수를 배열 형태로 반환합니다.
  return [favorites, toggleFavorite];
};
