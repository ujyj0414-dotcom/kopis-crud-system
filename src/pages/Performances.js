import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPerformances } from "../api/kopis";
import { useFavorites } from "../hooks/useFavorites";
import "./Performances.css";
import BoardLibraryPage from "./BoardLibraryPage";
import PollsPage from "./PollsPage";
import { POLLS_BUTTONS } from "../data/dummyPolls";

// --- 상수 선언부 ---
const GENRE_CODES = {
  ALL: "",
  THEATER: "AAAA",
  MUSICAL: "GGGA",
  CLASSIC: "CCCA",
  POPULAR_MUSIC: "CCCD",
  CIRCUS_MAGIC: "EEEB",
};
const GENRE_BUTTONS = {
  전체: GENRE_CODES.ALL,
  연극: GENRE_CODES.THEATER,
  뮤지컬: GENRE_CODES.MUSICAL,
  클래식: GENRE_CODES.CLASSIC,
  대중음악: GENRE_CODES.POPULAR_MUSIC,
  "서커스/마술": GENRE_CODES.CIRCUS_MAGIC,
};
const REGION_CODES = {
  ALL: "",
  SEOUL: "11",
  GYEONGGI: "41",
  BUSAN: "26",
  DAEGU: "27",
  INCHEON: "28",
};
const REGION_BUTTONS = {
  전체: REGION_CODES.ALL,
  서울: REGION_CODES.SEOUL,
  경기: REGION_CODES.GYEONGGI,
  부산: REGION_CODES.BUSAN,
  대구: REGION_CODES.DAEGU,
  인천: REGION_CODES.INCHEON,
};
const STATUS_CODES = { ONGOING: "02", EXPECTED: "01", COMPLETED: "03" };
const STATUS_BUTTONS = {
  공연중: STATUS_CODES.ONGOING,
  공연예정: STATUS_CODES.EXPECTED,
  공연완료: STATUS_CODES.COMPLETED,
};
const POPULAR_TYPES = { DAILY: "daily", WEEKLY: "weekly", MONTHLY: "monthly" };
const POPULAR_POSTS_BUTTONS = {
  일간: POPULAR_TYPES.DAILY,
  주간: POPULAR_TYPES.WEEKLY,
  월간: POPULAR_TYPES.MONTHLY,
};

// --- 더미 데이터 영역 ---
const TOTAL_DUMMY_POSTS = 100;
const DUMMY_POSTS_PER_PAGE = 12;
const titleTemplates = [
  "EDM 페스티벌 같이 갈 파티원 구함 (1/4)",
  "[정보] 2025 상반기 뮤지컬 라인업 떴다!",
  "요즘 제일 핫한 배우 OOO 실물 영접 후기.txt",
  "국립극장 해오름극장, 리모델링하고 진짜 좋아졌네",
  "나만 알고 싶은 인디밴드 추천해줄게",
  "[뷰티] 향수 뭐 써? 너무 흔하지 않고 좋은 향 추천 좀",
  "우리 집 앵무새가 요즘 미는 유행어",
  "내가 효과 본 피부 관리 꿀팁 (영업비밀임)",
  "서울 3대 빵집 도장 깨기 하고 왔다",
  "이 배우, 악역 전문인데 실제 성격은 완전 순둥이래",
  "민트초코 좋아하는 사람? 우리 동지 아니냐",
  "세상 평화롭게 자는 동물들 사진 모음",
  "인생 최고의 떡볶이 맛집 공유 좀",
  "고양이 액체설에 대한 확실한 증거사진",
  "혼뮤(혼자 뮤지컬) 처음인데 같이 설레줄 사람?",
  "우리 집 댕댕이 개인기 방출함 (심장 부여잡아)",
  "'ㅋㅋㅋ'랑 'ㅎㅎㅎ'의 미묘한 차이점에 대하여",
  "[레시피] 자취생을 위한 10분 컷 초간단 파스타",
  "배우들 발성 연습하는 거 보면 진짜 신기하지 않냐",
  "[정보] 오늘 저녁 8시, OOO 콘서트 티켓팅 참전할 사람?",
  "퇴근 10분 전, 심장 뛰는 속도가 달라진다",
  "[정보] 이번 주말 전국 연극/뮤지컬 할인 정보 모음",
  "공연장 갈 때 복장, 너무 편하게 입고 가도 괜찮아?",
  "팬미팅 처음 가보는데 꿀팁 좀 알려줘!",
  "배달비 5천원 시대, 님들은 주로 뭐 시켜 먹음?",
  "이 아이돌 그룹, 노래는 좋은데 왜 안 뜰까?",
  "주인이랑 표정 똑같이 짓는 강아지 ㅋㅋㅋ",
  "연기 천재라고 생각하는 10대 배우 누구 있음?",
  "퍼스널컬러 진단, 진짜 돈 값 할까? 받아본 사람 후기 좀",
  "오늘자 홍대 버스킹 레전드 찍은 일반인 ㄷㄷ",
  "다이어트 중인데 밤 11시에 라면 끓이는 중...",
  "[질문] 오페라글라스, 공연장에서 빌리는 게 나아? 사가는 게 나아?",
  "친구 결혼식 축의금 얼마가 적당하다고 봄?",
  "길 가다가 5만원 주웠다 ㅋㅋㅋ",
  "[좌석꿀팁] 블루스퀘어 3청은 오글(오페라글라스) 필수다",
  "이 배우, 무대 장악력이 진짜 미쳤음",
  "공연 보러 갈 때 쓰기 좋은 '지속력 갑' 파운데이션 추천",
  "대학로 연극 <옥탑방 고양이> 아직도 하네 ㄷㄷ",
  "내가 가진 쓸데없는 능력 하나씩 말해보자",
  "햄스터 쳇바퀴에 진심인 편",
  "블루스퀘어 신한카드홀 3층 시야, 생각보다 괜찮네?",
  "강아지 vs 고양이, 세기의 대결... 당신의 선택은?",
  "[정보] 이번 주말, 무료 야외 클래식 공연 정보",
  "세상에서 제일 억울하게 생긴 고양이.jpg",
  "내한 공연 좀 제발 많이 해줬으면 하는 해외 가수",
  "락 페스티벌 초심자가 챙겨야 할 필수템 목록",
  "4DX 영화 처음 봤는데 신세계다...",
  "어릴 때 제일 좋아했던 만화 뭐였어?",
  "혼자서 공연 보러 가는 사람 많아?",
  "댕댕이 산책시키다가 인싸된 썰",
  "BTS 신기록 또 세운 거 실화냐...",
  "아침에 눈 떴는데 주말이면 얼마나 좋을까",
  "[클래식] 쇼팽 녹턴 2번은 비 오는 날 들어야 제맛",
  "다이어트 성공한 사람들, 비법 좀 알려줘 제발",
  "요즘 애들 쓰는 신조어 테스트 (하나도 모르겠음)",
  "MBTI 물어보는 거 이제 좀 지겹지 않냐?",
  "헬스장 등록만 하고 안 가는 사람 나야 나",
  "편의점 꿀조합 레시피 나만 알기 아까워서 푼다",
  "재즈바 입문하려고 하는데 서울에 괜찮은 곳 추천 좀",
  "[좌석꿀팁] 예술의전당 콘서트홀 1층 C블럭 시야 후기",
  "영화 <범죄도시4> 보고 옴 (스포 없음)",
  "로또 1등 당첨되면 뭐부터 할 거임?",
  "[나눔] OOO 연극 초대권 2장 나눔합니다 (선착순)",
  "힙합 서바이벌 프로그램, 이제 좀 식상하지 않아?",
  "대학로 연극 <죽여주는 이야기> 보고 배꼽 빠지는 줄 알았음",
  "공연 시작 전/후에 밥 먹을 만한 맛집 추천 (예술의전당 근처)",
  "알파카 실제로 보면 생각보다 키 커서 놀람",
  "내가 만든 밀푀유나베 비주얼 좀 봐줘",
  "역시 비 오는 날엔 파전에 막걸리지",
  "[정보] 오늘부터 올리브영 빅세일 시작! (추천템 공유)",
  "웰시코기 엉덩이는 과학적으로 증명된 힐링템임",
  "[주의] 아기 리트리버 짤 보고 심쿵사 할 수 있음",
  "뮤지컬 배우들 퇴근길 실제로 본 썰 푼다",
  "맹수들의 아기 시절은 그냥 귀여운 고양이과임",
  "뮤지컬 <오페라의 유령> 본 사람 있어? 후기 좀...",
  "길에서 만난 고양이인데 나만 졸졸 따라와 ㅠㅠ",
  "여름 쿨톤 인생 립스틱 찾았다...",
  "지킬앤하이드, 조승우 캐스팅은 전설이다...",
  "내 인생 최고의 콘서트는 단연코 콜드플레이 내한 공연",
  "마라탕 처음 먹어봤는데... 이거 무슨 맛이냐?",
  "팬텀싱어 콘서트 다녀옴 (고막 힐링 제대로)",
  "밥 달라고 시위하는 우리 집 냥아치",
  "퍼스널컬러 진단받고 왔는데 완전 다른 사람 됨",
  "이 배우, 무대 장악력이 진짜 미쳤음",
  "내한 공연 좀 제발 많이 해줬으면 하는 해외 가수",
  "고양이 액체설에 대한 확실한 증거사진",
  "세상에서 제일 억울하게 생긴 고양이.jpg",
  "다이어트 성공한 사람들, 비법 좀 알려줘 제발",
  "인생 최고의 떡볶이 맛집 공유 좀",
  "EDM 페스티벌 같이 갈 파티원 구함 (1/4)",
];
const allPopularPosts = (() => {
  const dailyPosts = [];
  const titlesLength = titleTemplates.length;
  for (let i = 0; i < TOTAL_DUMMY_POSTS; i++) {
    const postId = `post_${i}`;
    dailyPosts.push({
      id: postId,
      title: titleTemplates[i % titlesLength],
      author: `작성자_${i + 1}`,
      image: `https://picsum.photos/seed/${postId}/300/400`,
      likes: Math.floor(Math.random() * 200) + 1,
      comments: Math.floor(Math.random() * 50),
    });
  }
  const weeklyPosts = dailyPosts.map((post) => ({
    ...post,
    likes: post.likes * (Math.floor(Math.random() * 4) + 7),
    comments: post.comments * (Math.floor(Math.random() * 4) + 7),
  }));
  const monthlyPosts = dailyPosts.map((post) => ({
    ...post,
    likes: post.likes * (Math.floor(Math.random() * 21) + 30),
    comments: post.comments * (Math.floor(Math.random() * 21) + 30),
  }));
  return {
    [POPULAR_TYPES.DAILY]: dailyPosts,
    [POPULAR_TYPES.WEEKLY]: [...weeklyPosts].sort(() => Math.random() - 0.5),
    [POPULAR_TYPES.MONTHLY]: [...monthlyPosts].sort(() => Math.random() - 0.5),
  };
})();
const fetchDummyPosts = (page, rows, type) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const targetData = allPopularPosts[type] || [];
      const startIndex = (page - 1) * rows;
      const endIndex = startIndex + rows;
      const paginatedData = targetData.slice(startIndex, endIndex);
      resolve(paginatedData);
    }, 300);
  });
};

function Performances() {
  const navigate = useNavigate();
  const [favorites, toggleFavorite] = useFavorites();
  const [genre, setGenre] = useState(GENRE_CODES.ALL);
  const [region, setRegion] = useState(REGION_CODES.ALL);
  const [performanceStatus, setPerformanceStatus] = useState(
    STATUS_CODES.ONGOING
  );
  const [performances, setPerformances] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [openMainMenu, setOpenMainMenu] = useState("performances");
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const observerTarget = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [selectedCommunityTab, setSelectedCommunityTab] = useState(null);
  const [selectedPopularType, setSelectedPopularType] = useState(
    POPULAR_TYPES.DAILY
  );
  const [selectedPollsType, setSelectedPollsType] = useState(POLLS_BUTTONS.HOT);

  const loadData = useCallback(
    async (isInitialLoad) => {
      if (isLoading) return;
      const currentPage = isInitialLoad ? 1 : page;
      if (!isInitialLoad && !hasMore) return;
      setIsLoading(true);
      let newItems = [];
      let itemsPerPage = 0;
      if (openMainMenu === "performances") {
        itemsPerPage = 8;
        newItems = await fetchPerformances(
          currentPage,
          itemsPerPage,
          genre,
          region,
          performanceStatus
        );
        setPerformances((prev) =>
          isInitialLoad ? newItems : [...prev, ...newItems]
        );
      } else if (
        openMainMenu === "community" &&
        selectedCommunityTab === "popular"
      ) {
        itemsPerPage = DUMMY_POSTS_PER_PAGE;
        newItems = await fetchDummyPosts(
          currentPage,
          itemsPerPage,
          selectedPopularType
        );
        setCommunityPosts((prev) =>
          isInitialLoad ? newItems : [...prev, ...newItems]
        );
      } else {
        setHasMore(false);
      }
      if (newItems.length > 0) {
        setHasMore(newItems.length === itemsPerPage);
      } else {
        setHasMore(false);
        if (isInitialLoad) {
          if (openMainMenu === "performances") setPerformances([]);
          else if (selectedCommunityTab === "popular") setCommunityPosts([]);
        }
      }
      setPage(currentPage + 1);
      setIsLoading(false);
    },
    [
      isLoading,
      page,
      hasMore,
      openMainMenu,
      genre,
      region,
      performanceStatus,
      selectedCommunityTab,
      selectedPopularType,
    ]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setPerformances([]);
    setCommunityPosts([]);
    if (openMainMenu !== "community" || selectedCommunityTab === "popular") {
      loadData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    openMainMenu,
    genre,
    region,
    performanceStatus,
    selectedCommunityTab,
    selectedPopularType,
  ]);

  useEffect(() => {
    if (
      openMainMenu === "community" &&
      (selectedCommunityTab === "boards" || selectedCommunityTab === "polls")
    ) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadData(false);
        }
      },
      { threshold: 1.0 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoading, loadData, openMainMenu, selectedCommunityTab]);

  const handleOptionClick = (filterType, code) => {
    if (filterType === "genre") setGenre(code);
    if (filterType === "region") setRegion(code);
    if (filterType === "status") setPerformanceStatus(code);
  };
  const handleMainMenuClick = (menuName) => {
    if (openMainMenu === menuName) return;
    setOpenMainMenu(menuName);
    if (menuName === "community") {
      setSelectedCommunityTab("popular");
      setSelectedPopularType(POPULAR_TYPES.DAILY);
    } else {
      setSelectedCommunityTab(null);
    }
  };
  const handleSubMenuMouseEnter = (menuType) => {
    clearTimeout(hoverTimeoutRef.current);
    setActiveSubMenu(menuType);
  };
  const handleSubMenuMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setActiveSubMenu(null), 200);
  };

  const handleCommunityTabClick = (tabName) => {
    if (selectedCommunityTab === tabName) return;
    setActiveSubMenu(null);
    setSelectedCommunityTab(tabName);
    if (tabName === "popular") {
      setSelectedPopularType(POPULAR_TYPES.DAILY);
    } else if (tabName === "polls") {
      setSelectedPollsType(POLLS_BUTTONS.HOT);
    }
  };

  const handlePopularTypeClick = (type) => {
    if (selectedPopularType === type && selectedCommunityTab === "popular")
      return;
    setOpenMainMenu("community");
    setSelectedCommunityTab("popular");
    setSelectedPopularType(type);
  };

  const handlePollsTypeClick = (code) => {
    if (selectedPollsType === code && selectedCommunityTab === "polls") return;
    setOpenMainMenu("community");
    setSelectedCommunityTab("polls");
    setSelectedPollsType(code);
  };

  const renderContent = () => {
    if (openMainMenu === "community") {
      if (selectedCommunityTab === "boards") {
        return <BoardLibraryPage />;
      }
      if (selectedCommunityTab === "polls") {
        return <PollsPage selectedPollsType={selectedPollsType} />;
      }
    }
    return (
      <>
        <div className="performance-grid">
          {openMainMenu === "performances" &&
            performances.map((perf, index) => {
              const isFavorited = favorites.has(perf.mt20id);
              const kopisDetailLink = `http://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?menuId=MNU_00099&mt20Id=${perf.mt20id}`;

              return (
                // --- [수정] ---
                // 1. 상세 페이지 이동 onClick 이벤트를 제거합니다.
                // 2. 불필요해진 래퍼 <div>를 제거하고, key를 performance-card div로 옮깁니다.
                // 3. CSS 클래스명 'performance-card-link'를 더 이상 사용하지 않으므로 제거합니다.
                <div
                  key={`${perf.mt20id}-${index}`}
                  className="performance-card"
                >
                  <img
                    src={perf.poster}
                    alt={perf.prfnm}
                    className="poster-image"
                  />
                  <div className="overlay">
                    <h3>{perf.prfnm}</h3>
                    <p>
                      {perf.prfpdfrom} ~ {perf.prfpdto || ""}
                    </p>
                    <div className="card-buttons-container">
                      <a
                        href={kopisDetailLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="booking-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        예매하기
                      </a>
                      <button
                        className={`favorite-btn ${
                          isFavorited ? "favorited" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(perf.mt20id);
                        }}
                      >
                        {isFavorited ? "♥" : "♡"} 찜하기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          {selectedCommunityTab === "popular" &&
            communityPosts.map((post) => (
              <div key={post.id} className="performance-card">
                <img
                  src={post.image}
                  alt={post.title}
                  className="poster-image"
                />
                <div className="overlay">
                  <h3>{post.title}</h3>
                  <div className="post-info-wrapper">
                    <p className="post-info">
                      <span className="like-info">♥ {post.likes}</span>
                      <span className="comment-info">💬 {post.comments}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div
          ref={observerTarget}
          style={{ height: "50px", textAlign: "center" }}
        >
          {isLoading && "데이터를 불러오는 중..."}
          {!hasMore &&
            (performances.length > 0 || communityPosts.length > 0) &&
            "모든 정보를 불러왔습니다."}
        </div>
      </>
    );
  };

  return (
    <div className="container">
      <div className="main-menu-container">
        <button
          className={`main-menu-button ${
            openMainMenu === "performances" ? "active" : ""
          }`}
          onClick={() => handleMainMenuClick("performances")}
        >
          공연
        </button>
        <button
          className={`main-menu-button ${
            openMainMenu === "community" ? "active" : ""
          }`}
          onClick={() => handleMainMenuClick("community")}
        >
          잡담
        </button>
      </div>

      {openMainMenu === "performances" && (
        <div className="filter-container">
          <div className="main-filter-tabs">
            <div
              className="filter-tab-item"
              onMouseEnter={() => handleSubMenuMouseEnter("genre")}
              onMouseLeave={handleSubMenuMouseLeave}
            >
              <button className={activeSubMenu === "genre" ? "active" : ""}>
                장르
              </button>
              <div
                className={`sub-filter-wrapper ${
                  activeSubMenu === "genre" ? "visible" : ""
                }`}
              >
                <div className="sub-filter-tabs">
                  {Object.entries(GENRE_BUTTONS).map(([name, code]) => (
                    <button
                      key={code}
                      className={genre === code ? "active" : ""}
                      onClick={() => handleOptionClick("genre", code)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="filter-tab-item"
              onMouseEnter={() => handleSubMenuMouseEnter("region")}
              onMouseLeave={handleSubMenuMouseLeave}
            >
              <button className={activeSubMenu === "region" ? "active" : ""}>
                지역
              </button>
              <div
                className={`sub-filter-wrapper ${
                  activeSubMenu === "region" ? "visible" : ""
                }`}
              >
                <div className="sub-filter-tabs">
                  {Object.entries(REGION_BUTTONS).map(([name, code]) => (
                    <button
                      key={code}
                      className={region === code ? "active" : ""}
                      onClick={() => handleOptionClick("region", code)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="filter-tab-item"
              onMouseEnter={() => handleSubMenuMouseEnter("status")}
              onMouseLeave={handleSubMenuMouseLeave}
            >
              <button className={activeSubMenu === "status" ? "active" : ""}>
                상태
              </button>
              <div
                className={`sub-filter-wrapper ${
                  activeSubMenu === "status" ? "visible" : ""
                }`}
              >
                <div className="sub-filter-tabs">
                  {Object.entries(STATUS_BUTTONS).map(([name, code]) => (
                    <button
                      key={code}
                      className={performanceStatus === code ? "active" : ""}
                      onClick={() => handleOptionClick("status", code)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {openMainMenu === "community" && (
        <div className="filter-container">
          <div className="main-filter-tabs">
            <div
              className="filter-tab-item"
              onMouseEnter={() => handleSubMenuMouseEnter("popular")}
              onMouseLeave={handleSubMenuMouseLeave}
            >
              <button
                className={selectedCommunityTab === "popular" ? "active" : ""}
                onClick={() => handleCommunityTabClick("popular")}
              >
                인기글
              </button>
              <div
                className={`sub-filter-wrapper ${
                  activeSubMenu === "popular" ? "visible" : ""
                }`}
              >
                <div className="sub-filter-tabs">
                  {Object.entries(POPULAR_POSTS_BUTTONS).map(([name, type]) => (
                    <button
                      key={type}
                      className={selectedPopularType === type ? "active" : ""}
                      onClick={() => handlePopularTypeClick(type)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="filter-tab-item"
              onMouseEnter={() => handleSubMenuMouseEnter("polls")}
              onMouseLeave={handleSubMenuMouseLeave}
            >
              <button
                className={selectedCommunityTab === "polls" ? "active" : ""}
                onClick={() => handleCommunityTabClick("polls")}
              >
                투표
              </button>
              <div
                className={`sub-filter-wrapper ${
                  activeSubMenu === "polls" ? "visible" : ""
                }`}
              >
                <div className="sub-filter-tabs">
                  {Object.entries(POLLS_BUTTONS).map(([name, code]) => (
                    <button
                      key={code}
                      className={selectedPollsType === code ? "active" : ""}
                      onClick={() => handlePollsTypeClick(code)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="filter-tab-item">
              <button
                className={selectedCommunityTab === "boards" ? "active" : ""}
                onClick={() => handleCommunityTabClick("boards")}
              >
                게시판
              </button>
            </div>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

export default Performances;
