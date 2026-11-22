# 장기요양기관 휴·폐업 도우미 v2

휴·폐업 자료이관 준비를 **실시간 대시보드**로 정리하는 정적 웹앱(PWA)입니다.
기존 앱(저장소 `hyupeup-guide-ref`, v29)의 업무 내용·공식 서식·규정 문구는 그대로 유지하고,
화면 구조와 디자인을 **화이트 미니멀 실시간 대시보드**로 다시 만들었습니다.

## 화면 구성

| 탭 | 내용 |
| --- | --- |
| **실시간 대시보드** | 업무(휴업·폐업) · 자료(자료이관·전건분실·이력없음) · 급여(제공중·없음) · 방문(대표자·대리인) · 예정월 · 급여종류를 고르면 필요한 서류·61개월 범위·예상 권수가 즉시 갱신됩니다. 체크리스트 진행률과 요약 복사도 이 화면에서 처리합니다. |
| **서식·예시** | 공단 제출서식 5종, 편철 별지 7종 PDF 미리보기·저장, 이관목록표 작성예시 |
| **질문·점검** | 자주 묻는 질문 검색, 방문 전 최종 점검 체크리스트(12항목) |

## 파일 구성

```
index.html                화면 3개 탭 (실시간 대시보드 / 서식·예시 / 질문·점검)
styles.css                화이트 미니멀 디자인 시스템 (#F9FAFB · #FFFFFF · #111827 · #E5E7EB)
app.js                    대시보드 상태·반응형 렌더, 61개월 계산, 편철 권수, 체크리스트 저장
manifest.webmanifest      PWA 설정 (theme #FFFFFF)
sw.js                     오프라인 캐시 (네트워크 우선 → 새 배포 즉시 반영)
assets/forms/*.pdf        공단 별지 서식 원본 5종
assets/forms/binding/*.pdf 편철 별지 7종 (별지 제22호 ~ 제26호)
assets/previews/*.png     서식 1쪽 미리보기 이미지 (모달 표시용)
assets/transfer_list_example.png  이관목록표 작성예시
icons/                    앱 아이콘
previews/                 검증용 스크린샷
```

## 로컬에서 보기

```bash
cd hyupeup-guide-v2
python3 -m http.server 8765
# 브라우저에서 http://127.0.0.1:8765/ 접속 (모바일 390x844 기준)
```

`file://`로 열면 서비스워커와 일부 상대경로가 동작하지 않으니 로컬 서버로 확인하세요.

## GitHub Pages 배포

1. 이 폴더의 **내용물 전체**(`previews/` 제외)를 저장소 최상위(root)에 올립니다.
2. 저장소 → Settings → Pages → Build and deployment에서 `Deploy from a branch` 선택.
3. Branch `main`(또는 `gh-pages`), 폴더 `/(root)`로 저장.
4. `https://<사용자명>.github.io/<저장소명>/` 로 접속합니다.

`index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `assets/`, `icons/`의 상대 경로를 유지해야 합니다.
서비스워커는 네트워크 우선이라 새 배포가 바로 반영되지만, 그래도 예전 화면이 보이면 `sw.js`의 `CACHE` 이름(`hyupeup-guide-v2-3`)을 올려 주세요.
