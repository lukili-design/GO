# Review.js 1.2.0

來源：https://github.com/reviewjs/annotate
下載：https://cdn.jsdelivr.net/npm/@reviewjs/annotate@1.2.0/annotate.js
授權：MIT，見同目錄 LICENSE。此處保留原版程式。

由 src/main.tsx 在 React 首次渲染後載入，打包時隨 public 一起複製，無需外部 CDN。

## 使用

點右下角 Review，輸入評審名稱後使用高亮、框選、釘點及留言。
在留言面板使用 Download 匯出、Import 匯入 JSON。
標註只存在當前瀏覽器，不會隨 Git 提交自動同步；目前未接入公開標註載入或多人同步。

GO 在同一網址內切換多個介面，原版 Review.js 按網址路徑儲存標註，
因此不同介面的標註尚未隔離。請在相同介面及相近視窗尺寸檢視座標標註，
切換介面前收起工具；正式跨頁評審需另行接入頁面識別。
