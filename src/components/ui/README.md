# GO UI 元件庫

本專案 CMS 與 APP 的共用基礎元件。後續新增頁面優先使用；舊頁面不主動改造。這是可逐步擴充的專案內元件庫，尚未涵蓋所有互動。

## 檔案

- `GoUI.tsx`：共用 React 元件。
- `go-ui.css`：顏色、圓角、間距、焦點、停用及深色樣式，由 `src/index.css` 統一載入。

## 現有元件

| 元件／樣式 | 用途 | 使用方式 |
| --- | --- | --- |
| `GoButton` | 按鈕 | `variant="primary"` 主操作、`secondary` 次操作、`quiet` 返回等輕量操作；預設 type 為 button，表單提交需指定 submit |
| `GoSurface` | CMS 內容面板 | 放置表單或內容，透過 className 添加內距 |
| `GoBanner` | 活動圖片 | 16:9、object-fit: cover；傳入 src 和描述圖片的 alt |
| `GoNotice` | 錯誤提示 | 使用 role=alert，適合需要立即注意的驗證錯誤 |
| `formControlClass` | 表單輸入樣式 | 套用到 input、select、textarea，另配 label |
| `go-app-header` | APP 返回列 | 搭配 quiet 按鈕 |
| `go-app-body` | APP 內容間距 | 統一內容內距與區塊間距 |

## 使用範例

以下路徑以 `src/components/activity` 內的頁面為例：

```tsx
import { GoButton, GoSurface, GoBanner, GoNotice, formControlClass } from '../ui/GoUI';

<GoSurface className="p-6 space-y-4">
  <label htmlFor="activity-name">活動名稱</label>
  <input id="activity-name" className={formControlClass} />
  {error && <GoNotice>{error}</GoNotice>}
  <GoButton variant="secondary" onClick={onCancel}>取消</GoButton>
  <GoButton type="submit">保存</GoButton>
</GoSurface>

<GoBanner src={bannerImage} alt="活動主視覺" />
```

## 使用規則

1. 新 CMS、APP 頁面先使用上述元件；缺少的互動按實際需求增加，不預先建立大量未使用元件。
2. 元件負責共用外觀；保存、發佈、投票等業務行為由頁面傳入。
3. APP 可保留活動自訂背景與主題；不強制所有頁面採用相同版面。
4. 舊頁面不主動重構。修改共用樣式前，檢查所有引用位置，避免影響已有頁面。
5. 不為統一樣式刪除原有字段、數據、按鈕或流程。
6. 新增元件後同步更新本文檔；可見改動在本機預覽檢查。

## 已接入的示範頁

- `src/components/activity/ActivityManager.tsx`：活動新增／編輯。
- `src/components/activity/AppActivityViews.tsx`：APP 活動詳情。

元件庫與專案一起由 GitHub Desktop 提交、推送，另一台電腦拉取後即可使用。

## 共用文字規格（按頁面啟用）

在頁面容器加上 `go-type`，即可統一系統字體及以下規格，毋須載入外部字體：

| 用途 | 字號 | 字重 | 行高 |
| --- | --- | --- | --- |
| 頁面標題 | 20px | 600 | 1.4 |
| 區塊標題 | 16px | 600 | 1.4 |
| 正文、表單、按鈕、Tab | 14px | 正文 400；操作 500；選中 600 | 1.5 |
| 輔助文字、候選簡介、投票進度 | 12px | 400–600 | 1.5 |

新元件優先使用 `--go-text-title`、`--go-text-section`、`--go-text-body`、`--go-text-caption` 變數；可用 `go-text-section`／`go-text-caption` 標記語意。避免另設 10px、11px 文字或 900 字重。
目前啟用於 CMS 投票新增／編輯和 APP 活動投票詳情。其他舊頁面不批次改動。

## CMS 菜單與列表（活動／簽到／抽獎共用）

- `GoCmsNavItem`：傳入 `icon`、`active`、`onClick` 和菜單名稱，統一圖示尺寸、間距、選中及深色模式。
- `GoCmsListHeader`：傳入 `icon`、`title`、`description`、`action`，統一標題卡片及右側新增按鈕。
- `GoCmsListFilters`：包住搜尋／篩選欄位，與表格分開呈現。
- `GoCmsTable`：children 放 `thead`、`tbody`，不要再嵌套 `table`；統一表頭底色、欄位間距、分隔線和橫向捲動。空結果放在 `tbody` 的跨欄儲存格。
- `GoCmsRowAction`：用於列表行內操作；`tone` 支援 `blue`、`green`、`purple`、`slate`。操作保持單行，表格窄時橫向捲動。

已接入活動列表、簽到列表、抽獎列表。這組緊湊列表元件不套用整頁 `go-type`；新增／編輯表單仍使用原有表單元件及字體規範。樣式只作用於元件，不改動其他舊頁面。

- `GoModalClose`：彈窗標題列右側的共用 × 關閉按鈕，提供可存取名稱、滑過及鍵盤焦點樣式；傳入 `onClick`。邀請函及電郵預覽已接入。

## CMS 頁面返回按鈕（必須遵循）

- 所有新增或修改的 CMS 頁面返回操作，必須使用 `GoBackButton`，不得自行拼接文字或另寫樣式。
- 固定顯示左箭頭圖示（16px）＋「返回」，使用 quiet 樣式；不使用「返回抽獎列表」「返回簽到列表」等不同文案。
- 放在頁面頂部操作列左側；保存、發佈等主要操作放右側。
- 使用方式：`<GoBackButton onClick={handleBack}/>`；未保存提醒等業務邏輯放在回調中保留。
- 彈窗關閉使用右上角 `GoModalClose`（×），不可用頁面返回按鈕代替。
- 驗收時檢查圖示、文案、位置及實際返回行為，不能只改文案。

## CMS 列表與記錄表格（必須遵循）

- 管理列表、參與名單、中獎記錄、簽到記錄及總體數據／詳情內的表格，統一使用 `GoCmsTable`，不可自行用普通 table 配獨立樣式。
- 表頭底色、字體、行距、內距、分隔線、圓角與橫向捲動由共用元件控制，不在頁面另加覆蓋樣式。
- 標題和工具列放在表格外；表格內容使用 thead、tbody、tr、th、td。操作按鈕使用 `GoCmsRowAction`。
- 空資料必須在 tbody 內顯示跨全部欄位的提示列，不另放表格外提示。
- 驗收要包含子頁籤及詳情頁中的列表，不能只檢查管理首頁。

- 長內容預覽的 `GoSurface` 使用 `go-preview-scroll`，限制在視窗內並允許垂直捲動；避免被面板預設 `overflow:hidden` 裁切。

## APP 活動詳情

- 活動詳情使用 `go-event-detail`、`go-event-body` 及 `go-event-section` 分區樣式；Banner 使用 CMS 配置與 `GoBanner` 16:9 比例。
- `go-event-tabs` 配合 `GoButton`，三個頁籤等寬同行、以底線標示當前頁，不可橫向截斷。
- 已結束活動隱藏報名表單，提供結果入口；邀請函沿用 CMS 個人卡片；先顯示本人中獎記錄，再列出獎項。

## CMS 配置表單分區

- `GoCmsFormSection`：配置表單的獨立內容卡片，使用共用 GoSurface，統一標題、描述、20px 內距及16px 欄位間距；與基本設定卡片並列，不另嵌自訂邊框。
- `GoCmsFormField`：統一標籤和輸入框間距，以 htmlFor 對應輸入框 id；輸入框沿用 formControlClass，預覽放同一欄位下方。
- 配置表單使用上述表單元件；資料列表與記錄表格仍使用 GoCmsTable。

- `GoMediaUpload`：共用圖片／音訊上傳欄位，提供上傳、更換、移除及預覽／試聽，與 GoCmsFormField 配合。檔案保存於本機瀏覽器，表單只儲存引用；未保存表單前不修改原設定。

- `GoExpandableText`：活動介紹預設最多三行，實際溢出才顯示「展開／收起」。依容器寬度及字體載入重新量測，不以字數判斷；不套用到其他未要求摺疊的內容。

## GoCmsMoreMenu

列表「更多」共用選單，傳入 items（label、onClick）。浮層掛於 body 避免被表格裁切，支援點擊外部及 Escape 關閉。核銷人員配置使用 VerificationStaffModal，沿用共用表格、按鈕及關閉元件。
