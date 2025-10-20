import React from "react";
import { useParams } from "react-router-dom";

function PerformanceDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>공연 상세 정보</h1>
      <p>공연 ID: {id}</p>
    </div>
  );
}

export default PerformanceDetail;
