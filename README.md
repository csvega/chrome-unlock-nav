# Unlock & Nav 크롬 확장

오른쪽 클릭/복사 제한을 해제하고, 자주 가는 사이트를 버튼으로 등록해 빠르게 이동할 수 있는 크롬 확장입니다.

## 크롬에 추가하기
https://chromewebstore.google.com/detail/anadaljmkeocmmhccckeiellphojiaae?utm_source=item-share-cb

## 주요 기능
- 우클릭/복사/드래그 등 제한 해제 토글
- 바로가기 버튼 등록 및 열기(새 탭)
- ⭐ **별표 버튼으로 현재 사이트 빠르게 추가**
- 🗑️ **우클릭으로 바로가기 삭제**
- 버튼/편집 목록 드래그로 순서 변경
- 파비콘 자동 표시
- 최대 30개까지 바로가기 관리

## 사용 방법
1. 확장 아이콘 클릭 후 `Unblocker ON/OFF` 토글
2. 현재 사이트 추가: 상단 ☆ 별표 클릭
3. 수동 추가: `Edit Shortcuts` → 이름/URL 입력 → `Save`
4. 바로가기 삭제: 버튼 우클릭 → `Delete`
5. 순서 변경: 버튼을 드래그

URL은 `https://` 없이 입력해도 자동으로 보정됩니다.

## 권한 안내
| 권한 | 용도 |
|------|------|
| `storage` | 토글 상태/바로가기 목록 저장 |
| `favicon` | 사이트 아이콘 표시 |
| `activeTab` | 현재 탭 정보 (별표 추가 기능) |
| `host_permissions` | 모든 페이지에서 제한 해제 동작 적용 |

## 동작 방식
- content script가 `document_start` 시점에 로드됩니다.
- `unblockEnabled`가 켜져 있을 때, 제한 관련 이벤트를 캡처 단계에서 차단합니다.
- `unblock-active` 클래스가 추가되면 선택/복사 제한 스타일을 해제합니다.

## 파일 구조
- `manifest.json`: 확장 메타데이터/권한
- `content.js`, `content.css`: 제한 해제 로직/스타일
- `popup.html`, `popup.js`, `popup.css`: 팝업 UI 및 바로가기 관리

## 참고
- 일부 사이트는 추가적인 스크립트 제한이 있어 완전히 해제되지 않을 수 있습니다.
- **한번 우클릭 해제하면 다시 제한할 때까지 유지됩니다.**
(어떤 사이트에서는 우클릭 해제로 인해 사이트가 제대로 작동하지 않을 수 있습니다. 이런 경우 다시 제한을 해야합니다.)
