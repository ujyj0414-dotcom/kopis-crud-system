// src/pages/FavoriteDetail.js

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPerformanceDetail } from "../api/kopis";
import { useChecklist } from "../hooks/useChecklist";
import "./FavoriteDetail.css";

const EditIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
    <path
      fillRule="evenodd"
      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      clipRule="evenodd"
    ></path>
  </svg>
);
const DeleteIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    ></path>
  </svg>
);

function FavoriteDetail() {
  const { id } = useParams();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const { items, addItem, toggleItem, deleteItem, updateItem } =
    useChecklist(id);
  const [newItemText, setNewItemText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      const data = await fetchPerformanceDetail(id);
      setPerformance(data);
      setLoading(false);
    };
    loadDetail();
  }, [id]);

  const handleAddItem = (e) => {
    e.preventDefault();
    addItem(newItemText);
    setNewItemText("");
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();
    updateItem(editingId, editingText);
    setEditingId(null);
    setEditingText("");
  };

  if (loading) {
    return <div>상세 정보를 불러오는 중입니다...</div>;
  }

  if (!performance) {
    return <div>공연 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container detail-container">
      <Link to="/favorites" className="back-link">
        ← My Page로 돌아가기
      </Link>

      <div className="performance-header">
        <img
          src={performance.poster}
          alt={performance.prfnm}
          className="detail-poster"
        />
        <div className="detail-info">
          <h2>{performance.prfnm}</h2>
          <p>
            <strong>장소:</strong> {performance.fcltynm}
          </p>
          <p>
            <strong>기간:</strong> {performance.prfpdfrom} ~{" "}
            {performance.prfpdto}
          </p>
          <p>
            <strong>장르:</strong> {performance.genrenm}
          </p>
        </div>
      </div>

      <div className="checklist-section">
        <h3>📝 나만의 관람 체크리스트</h3>
        <form onSubmit={handleAddItem} className="add-item-form">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="예: 티켓 예매하기"
          />
          <button type="submit">+ 추가</button>
        </form>

        <ul className="checklist">
          {items.map((item) => (
            <li key={item.id} className={item.completed ? "completed" : ""}>
              {editingId === item.id ? (
                <form onSubmit={handleUpdateItem} className="edit-item-form">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    autoFocus
                  />
                  <button type="submit">저장</button>
                  <button type="button" onClick={handleCancelEdit}>
                    취소
                  </button>
                </form>
              ) : (
                <>
                  <input
                    type="checkbox"
                    className="item-checkbox"
                    checked={item.completed}
                    onChange={() => toggleItem(item.id)}
                  />
                  <span
                    className="item-text"
                    onClick={() => toggleItem(item.id)}
                  >
                    {item.text}
                  </span>
                  <div className="item-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleStartEdit(item)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteItem(item.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p className="empty-checklist">
            체크리스트가 비어있습니다. 첫 항목을 추가해보세요!
          </p>
        )}
      </div>
    </div>
  );
}

export default FavoriteDetail;
