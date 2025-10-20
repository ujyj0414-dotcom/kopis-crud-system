import { XMLParser } from "fast-xml-parser";

// XML 문자열을 자바스크립트 객체(JSON)로 변환하는 함수
export const parseXmlToJson = (xmlString) => {
  const parser = new XMLParser({
    ignoreAttributes: false, // 속성도 함께 파싱
  });
  return parser.parse(xmlString);
};
