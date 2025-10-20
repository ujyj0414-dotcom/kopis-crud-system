/* [새 파일] src/pages/BoardLibraryPage.js */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { dummyBoardLibrary } from "../data/dummyBoardLibrary";
import "./BoardLibraryPage.css";

const TRANSITION_DURATION = 500;
const ITEMS_PER_PAGE = 12;

// 페이지네이션 UI를 위한 별도의 컴포넌트를 파일 내에 정의합니다.
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination-container">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="page-nav-button"
      >
        이전
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`page-number-button ${
            currentPage === number ? "active" : ""
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="page-nav-button"
      >
        다음
      </button>
    </nav>
  );
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // delay 이후에 value를 업데이트하는 타이머를 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // value나 delay가 바뀌면 이전 타이머를 클리어하고 새로 시작
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function BoardLibraryPage() {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearchTerm = useDebounce(inputValue, 500);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [boards, setBoards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setBoards(dummyBoardLibrary);
  }, []);

  const handleToggleLike = (boardId) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId ? { ...board, isLiked: !board.isLiked } : board
      )
    );
  };

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef(null);

  const topBoards = useMemo(() => {
    if (boards.length === 0) return [];
    return [...boards]
      .sort((a, b) => b.weeklyViews - a.weeklyViews)
      .slice(0, 10);
  }, [boards]);

  const sliderItems = useMemo(() => {
    if (topBoards.length === 0) return [];
    const firstClone = topBoards[0];
    const lastClone = topBoards[topBoards.length - 1];
    return [lastClone, ...topBoards, firstClone];
  }, [topBoards]);

  const filteredBoards = useMemo(
    () =>
      boards.filter((board) =>
        board.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ),
    [boards, debouncedSearchTerm] // searchTerm -> debouncedSearchTerm
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const paginatedBoards = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBoards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredBoards]);

  const totalPages = Math.ceil(filteredBoards.length / ITEMS_PER_PAGE);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === 0) {
      sliderRef.current.style.transition = "none";
      setCurrentIndex(sliderItems.length - 2);
    } else if (currentIndex === sliderItems.length - 1) {
      sliderRef.current.style.transition = "none";
      setCurrentIndex(1);
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      sliderRef.current.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;
    }
  }, [currentIndex, isTransitioning]);

  const goToPrevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const goToNextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const cardWidth = 320;
  const cardMargin = 15;
  const totalCardWidth = cardWidth + cardMargin * 2;
  const sliderTranslateX = `calc(50% - ${currentIndex * totalCardWidth}px - ${
    totalCardWidth / 2
  }px)`;

  return (
    <>
      <header className="sticky-header">
        <div className="header-content">
          <div className="search-container">
            <input
              type="text"
              className={`search-input ${isSearchActive ? "active" : ""}`}
              placeholder="관심있는 주제를 검색..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus={isSearchActive}
            />
            <button
              className="search-icon-button"
              onClick={() => setIsSearchActive(!isSearchActive)}
            >
              {isSearchActive ? "✕" : "🔍"}
            </button>
          </div>
        </div>
      </header>

      <main className="board-library-container">
        <section className="hero-slider-section">
          <h2>🏆 인기 게시판 TOP {topBoards.length}</h2>
          <div className="slider-wrapper">
            <div
              className="slider-container"
              ref={sliderRef}
              style={{ transform: `translateX(${sliderTranslateX})` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {sliderItems.map((board, index) => (
                <div
                  key={`${board.id}-${index}`}
                  className={`hero-board-card ${
                    index === currentIndex ? "active" : ""
                  }`}
                  onClick={() => {
                    if (isTransitioning) return;
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                  }}
                >
                  <img src={board.image} alt={board.name} />
                  <div className="card-overlay">
                    <div className="info-default">
                      <span className="card-rank">
                        TOP {topBoards.findIndex((b) => b.id === board.id) + 1}
                      </span>
                      <h3 className="card-title">{board.name}</h3>
                      <p className="card-description">
                        {board.description || ""}
                      </p>
                    </div>
                    <div className="info-hover">
                      <span className="hover-views">
                        👁️ 주간 방문 {board.weeklyViews}
                      </span>
                      <button
                        className={`like-button ${
                          board.isLiked ? "liked" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLike(board.id);
                        }}
                      >
                        {board.isLiked ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="slider-nav-button left" onClick={goToPrevSlide}>
            {"<"}
          </button>
          <button className="slider-nav-button right" onClick={goToNextSlide}>
            {">"}
          </button>
        </section>

        <section className="library-section">
          <h2>
            {debouncedSearchTerm
              ? `'${debouncedSearchTerm}' 검색 결과`
              : "📚 전체 게시판"}
          </h2>
          <div className="board-grid">
            {paginatedBoards.map((board) => (
              <div key={board.id} className="board-card">
                <div className="card-image-wrapper">
                  <img src={board.image} alt={board.name} />
                  <div className="grid-hover-overlay">
                    <span className="grid-views">👁️ {board.weeklyViews}</span>
                    <button
                      className={`grid-like-button ${
                        board.isLiked ? "liked" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(board.id);
                      }}
                    >
                      {board.isLiked ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>
                <div className="card-content">
                  <h3>{board.name}</h3>
                  <div className="card-info">
                    <span>게시글 {board.posts}</span>
                    <span>{board.lastActivity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </main>

      <button className="create-board-fab">+</button>
    </>
  );
}

export default BoardLibraryPage;
