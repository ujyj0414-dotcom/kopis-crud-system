import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import { fetchFavoritePerformances } from "../api/kopis";
import "./Favorites.css";

function Favorites() {
  const [favorites, toggleFavorite] = useFavorites();
  const [favoritePerformances, setFavoritePerformances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      const favoriteIds = Array.from(favorites);

      if (favoriteIds.length > 0) {
        const data = await fetchFavoritePerformances(favoriteIds);
        setFavoritePerformances(data);
      } else {
        setFavoritePerformances([]);
      }
      setLoading(false);
    };

    loadFavorites();
  }, [favorites]);

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="status-message">찜 목록을 불러오는 중입니다...</div>
      </div>
    );
  }

  return (
    // [수정] 아래 div에 "favorites-page" 클래스를 추가합니다.
    <div className="container favorites-page">
      <h1>찜 목록 (My Page)</h1>
      {favoritePerformances.length > 0 ? (
        <div className="performance-grid">
          {favoritePerformances.map((perf) => (
            // --- 여기가 수정됩니다 ---
            // key를 최상위 div로 이동하고, Link가 카드 전체를 감싸지 않도록 변경
            <div key={perf.mt20id} className="performance-card">
              <img
                src={perf.poster}
                alt={perf.prfnm}
                className="poster-image"
              />
              <div className="overlay">
                <h3>{perf.prfnm}</h3>
                <p>
                  {perf.prfpdfrom} ~ {perf.prfpdto}
                </p>

                {/* 버튼들을 담을 컨테이너 추가 */}
                <div className="button-group">
                  {/* '찜 취소' 버튼 */}
                  <button
                    className="favorite-btn favorited"
                    onClick={(e) => {
                      // 이제 Link 안에 있지 않으므로 이벤트 전파 방지 코드는 필요 없습니다.
                      toggleFavorite(perf.mt20id);
                    }}
                  >
                    ♥ 찜 취소
                  </button>

                  {/* '체크리스트' 버튼을 Link 컴포넌트로 만듭니다 */}
                  <Link
                    to={`/favorites/${perf.mt20id}`}
                    className="checklist-btn"
                  >
                    📝 체크리스트
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">
          찜한 공연이 없습니다. 공연 목록에서 원하는 공연을 추가해보세요!
        </p>
      )}
    </div>
  );
}

export default Favorites;
