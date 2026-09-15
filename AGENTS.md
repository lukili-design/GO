# GO 專案指引

處理此倉庫的 APP、CMS、保安/訪客演示修改、預覽、Git 同步或發布問題時，先閱讀並遵循專案 Skill：

[go-project-workflow](.agents/skills/go-project-workflow/SKILL.md)

以用戶當前要求為準。此指引不授予額外發布權限，也不改變執行環境的權限限制。

## CMS／APP 共用元件庫

- 新增 CMS 或 APP 頁面時，先閱讀 [GO UI 使用說明](src/components/ui/README.md)，優先使用現有共用元件。
- 舊頁面不主動重構、不批次替換樣式；只有用戶明確要求時才修改。已接入元件的示範頁保留現狀。
- 修改共用元件時檢查既有使用頁面，避免連帶改變舊頁面的外觀和互動。
- 不因統一樣式刪減任何字段、內容、數據、按鈕或業務流程。
