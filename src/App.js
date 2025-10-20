import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";
import Logo from "./components/Logo";
import "./App.css";

// --- Lazy Loading 설정 (경로는 그대로 유지) ---
const Performances = lazy(() => import("./pages/Performances"));
const PerformanceDetail = lazy(() => import("./pages/PerformanceDetail"));
const Favorites = lazy(() => import("./pages/Favorites"));
const FavoriteDetail = lazy(() => import("./pages/FavoriteDetail"));

function App() {
  return (
    <Router>
      <div className="App">
        <header className="site-header">
          <div className="header-container">
            <Link to="/" className="logo-link">
              <Logo />
              <span className="logo-text">STAGE FINDER</span>
            </Link>

            <nav className="main-nav">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                HOME
              </NavLink>
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                MY PAGE
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Suspense fallback={<div>페이지를 불러오는 중입니다...</div>}>
            <Routes>
              {/* --- [수정] Route 설정 --- */}

              {/* 1. 메인 페이지(HOME)의 경로를 '/'로 변경 */}
              <Route path="/" element={<Performances />} />

              {/* 2. 공연 상세 페이지 (경로 유지) */}
              <Route path="/performance/:id" element={<PerformanceDetail />} />

              {/* 3. 찜 목록 페이지 (MY PAGE) (경로 유지) */}
              <Route path="/favorites" element={<Favorites />} />

              {/* 4. 찜한 공연의 체크리스트 상세 페이지 (경로 유지) */}
              <Route path="/favorites/:id" element={<FavoriteDetail />} />

              {/* [삭제] 이전 /performances 경로는 이제 사용하지 않으므로 Route를 하나로 통합합니다. */}
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
