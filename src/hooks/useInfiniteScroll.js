import { useState, useEffect, useRef } from "react";
/**
 * 무한 스크롤을 위한 커스텀 훅
 * @param {function} fetchCallback - 데이터를 가져오는 비동기 콜백 함수. 페이지 번호를 인자로 받는다.
 * @returns {object} { items, containerRef, isLoading }
 * - items: 누적된 데이터 배열
 * - containerRef: 감시할 DOM 요소를 위한 ref
 * - isLoading: 데이터 로딩 상태
 */
export const useInfiniteScroll = (fetchCallback) => {
  const [items, setItems] = useState([]); // 누적될 아이템 목록
  const [page, setPage] = useState(1); // 현재 페이지 번호
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부

  // 1. 감시할 대상을 지정하기 위한 ref 생성
  const containerRef = useRef(null);

  // 2. 데이터를 불러오는 함수
  const loadMoreItems = async () => {
    if (isLoading || !hasMore) return; // 로딩 중이거나 더 이상 데이터가 없으면 실행하지 않음

    setIsLoading(true);
    const newItems = await fetchCallback(page); // 콜백 함수를 통해 외부에서 데이터 fetching

    if (newItems.length > 0) {
      setItems((prevItems) => [...prevItems, ...newItems]); // 기존 아이템에 새 아이템 추가
      setPage((prevPage) => prevPage + 1); // 다음 페이지로
    } else {
      setHasMore(false); // 받아온 데이터가 없으면 더 이상 로드하지 않음
    }

    setIsLoading(false);
  };

  // 3. Intersection Observer를 사용한 스크롤 감지
  useEffect(() => {
    // IntersectionObserver: 특정 요소(element)가 화면(viewport)에 들어오거나 나갈 때를 감지
    const observer = new IntersectionObserver(
      (entries) => {
        // entries[0]가 감시 대상
        if (entries[0].isIntersecting) {
          loadMoreItems(); // 감시 대상이 화면에 보이면 다음 데이터 로드
        }
      },
      { threshold: 1.0 } // 감시 대상이 100% 보여야 콜백 실행
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef); // 감시 시작
    }

    // 4. 컴포넌트가 사라질 때 감시를 중단 (메모리 누수 방지)
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMoreItems]); // 의존성 배열: 이 값들이 바뀔 때마다 effect 재실행

  // 훅의 결과물 반환
  return { items, containerRef, isLoading };
};
