/* [최종 수정] src/pages/PollsPage.js (데이터 호출 방식 변경 및 정렬 완전 제거) */

import React, { useState, useEffect, useCallback, useRef } from "react";
// [핵심] 데이터 import 방식 변경 및 오류 수정
import { dummyPollData, POLLS_BUTTONS } from "../data/dummyPolls";
import "./PollsPage.css";

// --- SVG 아이콘 컴포넌트 (변경 없음) ---
const ThumbsUpIcon = () => (
  // (이 컴포넌트는 변경되지 않음)
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.25a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25h1.383z"
    />
  </svg>
);

const ThumbsDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.367 13.5c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75A2.25 2.25 0 017.5 19.5c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H4.374c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-1.285.213-2.533.623-3.722.045-.422.068-.85.068-1.285a11.95 11.95 0 012.649-7.521c.388-.482.987-.729 1.605-.729H10.52c.483 0 .964.078 1.423.23l3.114 1.04a4.501 4.501 0 001.423.23h1.383a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25h-1.383z"
    />
  </svg>
);

const CommentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.16 2.16.287 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
    />
  </svg>
);

const DUMMY_POLLS_PER_PAGE = 10;

// [핵심] fetch 로직 대폭 단순화
const fetchDummyPolls = (page, rows, type) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 해당 타입의 전용 데이터 배열을 가져옴
      const sourceData = dummyPollData[type] || [];
      let dataToPaginate = [...sourceData];

      // '신규' 탭만 최신순(ID 역순)으로 정렬
      if (type === POLLS_BUTTONS.신규) {
        dataToPaginate.sort(
          (a, b) => parseInt(b.id.split("_")[1]) - parseInt(a.id.split("_")[1])
        );
      }

      const startIndex = (page - 1) * rows;
      const endIndex = startIndex + rows;
      const paginatedData = dataToPaginate.slice(startIndex, endIndex);
      resolve(paginatedData);
    }, 300);
  });
};

function PollsPage({ selectedPollsType }) {
  const [polls, setPolls] = useState([]);
  const [pollVotes, setPollVotes] = useState({});
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const loadPolls = useCallback(
    async (isInitialLoad) => {
      if (isLoading) return;
      const currentPage = isInitialLoad ? 1 : page;
      if (!isInitialLoad && !hasMore) return;
      setIsLoading(true);
      const newItems = await fetchDummyPolls(
        currentPage,
        DUMMY_POLLS_PER_PAGE,
        selectedPollsType
      );
      if (newItems.length > 0) {
        // 각 데이터 소스는 100개 이므로, 10페이지가 넘어가면 더이상 데이터가 없음
        setHasMore(currentPage * DUMMY_POLLS_PER_PAGE + newItems.length < 100);
        setPolls((prev) => (isInitialLoad ? newItems : [...prev, ...newItems]));
        setPage(currentPage + 1);
      } else {
        setHasMore(false);
        if (isInitialLoad) setPolls([]);
      }
      setIsLoading(false);
    },
    [isLoading, page, hasMore, selectedPollsType]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setPolls([]); // 탭 변경 시 기존 목록 초기화
    loadPolls(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPollsType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadPolls(false);
        }
      },
      { threshold: 1.0 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoading, loadPolls]);

  const handleVote = (e, pollId, voteType) => {
    e.preventDefault();
    e.stopPropagation();
    setPolls((currentPolls) =>
      currentPolls.map((poll) => {
        if (poll.id !== pollId) return poll;
        const currentVote = pollVotes[pollId];
        let newLikes = poll.likes;
        let newDislikes = poll.dislikes;
        let nextVoteState;
        if (currentVote === voteType) {
          nextVoteState = null;
          voteType === "like" ? newLikes-- : newDislikes--;
        } else if (currentVote) {
          nextVoteState = voteType;
          if (voteType === "like") {
            newLikes++;
            newDislikes--;
          } else {
            newLikes--;
            newDislikes++;
          }
        } else {
          nextVoteState = voteType;
          voteType === "like" ? newLikes++ : newDislikes++;
        }
        setPollVotes((prev) => ({ ...prev, [pollId]: nextVoteState }));
        return { ...poll, likes: newLikes, dislikes: newDislikes };
      })
    );
  };

  return (
    <>
      <div className="performance-grid">
        {polls.map((poll) => (
          <div key={poll.id} className="performance-card">
            <img src={poll.image} alt={poll.title} className="poster-image" />
            <div className="overlay">
              <h3
                style={{
                  top: "33.3%",
                  bottom: "auto",
                  left: "15px",
                  right: "15px",
                  transform: "translateY(-50%)",
                  textAlign: "center",
                  whiteSpace: "normal",
                  textShadow: "1px 1px 4px black",
                  fontSize: "1.2rem",
                }}
              >
                {poll.title}
              </h3>

              <div className="card-actions-container">
                <div className="like-dislike-group">
                  <div
                    className={`action-button-group like ${
                      pollVotes[poll.id] === "like" ? "active" : ""
                    }`}
                    onClick={(e) => handleVote(e, poll.id, "like")}
                  >
                    <div className="action-icon-wrapper">
                      <ThumbsUpIcon />
                    </div>
                    <span className="action-count">
                      {poll.likes.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`action-button-group dislike ${
                      pollVotes[poll.id] === "dislike" ? "active" : ""
                    }`}
                    onClick={(e) => handleVote(e, poll.id, "dislike")}
                  >
                    <div className="action-icon-wrapper">
                      <ThumbsDownIcon />
                    </div>
                    <span className="action-count">
                      {poll.dislikes.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="comment-group">
                  <div className="action-icon-wrapper">
                    <CommentIcon />
                  </div>
                  <span className="action-count">
                    {poll.comments.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div ref={observerTarget} style={{ height: "50px", textAlign: "center" }}>
        {isLoading && "투표 목록을 불러오는 중..."}
        {!hasMore && polls.length === 0 && !isLoading && (
          <p>표시할 투표가 없습니다.</p>
        )}
        {!hasMore && polls.length > 0 && "모든 투표를 불러왔습니다."}
      </div>
    </>
  );
}

export default PollsPage;
