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
