// kopis-crud-system/server/index.js (전체 교체)

const express = require("express");
const axios = require("axios");
const cors = require("cors");
// [추가] XML<->JSON 변환을 위해 xml-js 라이브러리를 사용합니다.
// 터미널에서 `npm install xml-js` 를 먼저 실행해주세요.
const convert = require("xml-js");

const app = express();
const PORT = 4000;
// [원복] .env를 사용하지 않고, 기존 방식대로 API 키를 코드에 직접 할당합니다.
const KOPIS_API_KEY = "36caeac506d74094b15a55ffb666b49d";

// [추가] XML <-> JSON 변환을 위한 헬퍼 함수
const parseXmlToJson = (xml) => {
  try {
    const json = convert.xml2json(xml, { compact: true, spaces: 2 });
    return JSON.parse(json);
  } catch (error) {
    console.error("XML 파싱 오류:", error);
    return null;
  }
};

// [추가] KOPIS ID와 인터파크 상품 코드를 매칭시키는 데이터베이스 역할
// 여기에 ID와 코드를 계속 추가하여 예매 링크를 활성화할 수 있습니다.
const performanceIdToInterparkCodeMap = {
  PF276409: "25014773", // 예시: 임시거주
  PF276385: "24007324", // 예시: 렌트
  PF276310: "25014636", // 예시: 남성춤6인전
  PF276119: "24008980", // 예시: 노인과 바다
  // ... (필요에 따라 계속 추가)
};

app.use(cors());

// [수정] 공연 목록 API: 인터파크 코드를 추가하여 반환
app.get("/api/performances", async (req, res) => {
  try {
    const apiParams = {
      service: KOPIS_API_KEY,
      ...req.query,
    };
    Object.keys(apiParams).forEach(
      (key) => !apiParams[key] && delete apiParams[key]
    );
    const queryString = new URLSearchParams(apiParams).toString();
    const apiUrl = `http://www.kopis.or.kr/openApi/restful/pblprfr?${queryString}`;
    const response = await axios.get(apiUrl, { responseType: "text" });

    const jsonData = parseXmlToJson(response.data);
    const originalPerformances = jsonData?.dbs?.db;

    if (!originalPerformances) {
      return res.send(response.data);
    }

    const performancesArray = Array.isArray(originalPerformances)
      ? originalPerformances
      : [originalPerformances];

    const modifiedPerformances = performancesArray.map((perf) => {
      const performanceId = perf.mt20id._text;
      const interparkCode = performanceIdToInterparkCodeMap[performanceId];

      if (interparkCode) {
        console.log(`(목록) ✅ 매칭 성공: KOPIS ID = ${performanceId}`);
      }
      // 실패 로그는 너무 많이 찍힐 수 있으므로 주석 처리. 필요시 활성화.
      // else {
      //   console.log(`(목록) ❌ 매칭 실패: KOPIS ID = ${performanceId}`);
      // }

      return {
        ...perf,
        interparkCode: interparkCode ? { _text: interparkCode } : undefined,
      };
    });

    const finalJsonData = { dbs: { db: modifiedPerformances } };
    const finalXmlData = convert.json2xml(finalJsonData, {
      compact: true,
      spaces: 2,
    });

    res.type("application/xml").send(finalXmlData);
  } catch (error) {
    console.error("[오류] /api/performances:", error.message);
    res.status(500).json({ message: "서버에서 API 호출 중 오류 발생" });
  }
});

// [수정] 공연 상세 정보 API: 인터파크 코드를 추가하여 반환
app.get("/api/performance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const apiUrl = `http://www.kopis.or.kr/openApi/restful/pblprfr/${id}?service=${KOPIS_API_KEY}`;
    const response = await axios.get(apiUrl, { responseType: "text" });

    const jsonData = parseXmlToJson(response.data);
    const originalPerformance = jsonData?.dbs?.db;

    if (!originalPerformance) {
      return res.send(response.data);
    }

    const interparkCode = performanceIdToInterparkCodeMap[id];
    if (interparkCode) {
      console.log(`(상세) ✅ 매칭 성공: KOPIS ID = ${id}`);
    } else {
      console.log(`(상세) ❌ 매칭 실패: KOPIS ID = ${id}`);
    }

    const modifiedPerformance = {
      ...originalPerformance,
      interparkCode: interparkCode ? { _text: interparkCode } : undefined,
    };

    const finalJsonData = { dbs: { db: modifiedPerformance } };
    const finalXmlData = convert.json2xml(finalJsonData, {
      compact: true,
      spaces: 2,
    });

    res.type("application/xml").send(finalXmlData);
  } catch (error) {
    console.error(`[오류] /api/performance/${id}:`, error.message);
    res
      .status(500)
      .json({ message: "서버에서 상세 정보 API 호출 중 오류 발생" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
