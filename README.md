# 庫存管理系統 - Inventory Management System

一個採用日式無印良品（Muji）風格設計的庫存管理系統，整合 Google Sheets 作為後端數據庫。

## 功能特色

- ✅ **庫存概覽**：即時查看庫存狀態，含訂單預售庫存追蹤
- ✅ **訂單管理**：建立訂單、查看歷史訂單、刪除錯誤訂單
- ✅ **成本管理**：記錄進貨成本、自動計算總價
- ✅ **定價管理**：設定售價、自動計算毛利率
- ✅ **低庫存警報**：基於剩餘庫存的智能提醒
- ✅ **訂單預售庫存**：自動追蹤已被訂單佔用的庫存

## 技術架構

- **前端**：React + Vite
- **樣式**：Vanilla CSS (Muji 風格)
- **後端**：Google Apps Script
- **數據庫**：Google Sheets
- **圖標**：Lucide React

---

## 快速開始

### 1. 本地開發環境設置

#### 安裝依賴
```bash
npm install
```

#### 啟動開發伺服器
```bash
npm run dev
```

#### 建置生產版本
```bash
npm run build
```

---

## Google Sheets 設置指南

### 步驟 1：建立 Google Sheets

1. 前往 [Google Sheets](https://sheets.google.com/)
2. 點擊「空白」建立新試算表
3. 將試算表命名為「庫存管理系統」

### 步驟 2：建立工作表

請依照以下結構建立 **4 個工作表**（Sheet）：

#### 工作表 1：庫存
| 品項 | 庫存量 | 訂單預售庫存 | 剩餘庫存 |
|------|--------|--------------|----------|
| 麻製品收納盒 | 15 | 0 | =B2-C2 |
| 不鏽鋼杯 | 8 | 2 | =B3-C3 |
| 香氛噴霧 | 20 | 0 | =B4-C4 |

> **重要**：「剩餘庫存」欄位使用公式 `=B2-C2`（庫存量 - 訂單預售庫存）

#### 工作表 2：單品成本
| 日期 | 品項 | 進貨量 | 品項進貨單價 | 品項進貨總價 |
|------|------|--------|--------------|--------------|
| 2024-01-20 | 不鏽鋼杯 | 10 | 100 | 1000 |
| 2024-01-21 | 麻製品收納盒 | 20 | 150 | 3000 |

#### 工作表 3：單品定價
| 品項 | 品項進貨單價 | 品項定價 | 毛利率 |
|------|--------------|----------|--------|
| 不鏽鋼杯 | 100 | 250 | =IF(C2>0, (C2-B2)/C2, 0) |
| 麻製品收納盒 | 150 | 300 | =IF(C3>0, (C3-B3)/C3, 0) |

> **重要**：「毛利率」欄位使用公式 `=IF(C2>0, (C2-B2)/C2, 0)`

#### 工作表 4：訂單
| 日期 | 訂單品項明細 | 訂單總價 |
|------|--------------|----------|
| 2024-01-28 | 不鏽鋼杯 x 2 | 500 |

---

## Google Apps Script 設置指南

### 步驟 1：開啟 Apps Script 編輯器

1. 在你的 Google Sheets 中，點擊上方選單：**擴充功能** → **Apps Script**
2. 這會開啟一個新的 Apps Script 編輯器視窗

### 步驟 2：貼上後端代碼

1. 刪除編輯器中的預設代碼（`function myFunction() {...}`）
2. 打開專案中的 `GAS-code.gs` 檔案
3. **複製全部內容**並貼到 Apps Script 編輯器中
4. 點擊上方的「💾 儲存專案」圖示

### 步驟 3：部署為網路應用程式

1. 點擊右上角的「**部署**」→ 「**新增部署作業**」
2. 在「選取類型」旁邊，點擊「⚙️ 齒輪圖示」→ 選擇「**網路應用程式**」
3. 設定以下選項：
   - **說明**：庫存管理系統 API
   - **執行身分**：我（你的 Google 帳號）
   - **具有存取權的使用者**：**任何人**（重要！）
4. 點擊「**部署**」
5. 系統會要求授權，點擊「**授權存取權**」
6. 選擇你的 Google 帳號
7. 如果出現「Google 尚未驗證這個應用程式」警告：
   - 點擊「**進階**」
   - 點擊「**前往『庫存管理系統』（不安全）**」
   - 點擊「**允許**」
8. **複製部署後的「網路應用程式 URL」**（格式類似：`https://script.google.com/macros/s/AKfycby.../exec`）

### 步驟 4：測試 API 連線

1. 在瀏覽器中開啟剛才複製的 URL
2. 如果看到 JSON 格式的數據（包含 `inventory`, `costs`, `pricings`, `orders`），表示設置成功！

---

## 前端環境變數設置

### 步驟 1：建立環境變數檔案

1. 在專案根目錄中，將 `.env.example` 重新命名為 `.env`
2. 或者直接建立一個新的 `.env` 檔案

### 步驟 2：設定 Google Apps Script URL

在 `.env` 檔案中，貼上你的 Google Apps Script URL：

```env
VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/你的部署ID/exec
```

### 步驟 3：重新啟動開發伺服器

```bash
# 停止目前的伺服器（Ctrl + C）
# 重新啟動
npm run dev
```

---

## 使用說明

### 庫存概覽
- 查看所有品項的庫存狀態
- **庫存量**：總庫存數量
- **訂單預售庫存**：已被訂單佔用的數量
- **剩餘庫存**：實際可用庫存（自動計算）
- **狀態**：剩餘庫存 ≤ 5 時顯示「低庫存」警告

### 建立訂單
1. 點擊「建立訂單」
2. 選擇品項並輸入數量
3. 可新增多個品項
4. 點擊「提交訂單」
5. 系統會自動：
   - 增加「訂單預售庫存」
   - 減少「剩餘庫存」
   - 記錄訂單到 Google Sheets

### 訂單管理
- 查看所有歷史訂單
- 刪除錯誤訂單（會自動還原訂單預售庫存）

### 成本管理
- 記錄每次進貨的成本
- 自動計算品項進貨總價

### 定價管理
- 設定每個品項的售價
- 自動計算毛利率
- 毛利率 < 20% 時以紅色標示警告

---

## 🚀 自動部署到 GitHub Pages

本專案已設定 **GitHub Actions** 自動部署流程。

### 步驟 1：建立 GitHub 儲存庫 (Repository)
1. 在 GitHub 上建立一個新的 Public Repository。
2. 將本專案推送 (Push) 到該儲存庫。

### 步驟 2：設定安全環境變數 (Secrets)
**⚠️ 重要：** 為了安全起見，不要將 URL 直接寫在代碼中。請使用 Secrets。
1. 進入你的 GitHub Repository 頁面。
2. 點擊 top bar 的 **Settings** (設定)。
3. 在左側選單找到 **Secrets and variables** → **Actions**。
4. 點擊 **New repository secret** (綠色按鈕)。
5. 輸入資訊：
   - **Name**: `VITE_GOOGLE_APP_SCRIPT_URL`
   - **Secret**: (貼上您的 Google Apps Script 網址，如 `https://script.google.com/macros/s/.../exec`)
6. 點擊 **Add secret**。

### 步驟 3：啟用 GitHub Pages
1. 在 **Settings** 頁面左側找到 **Pages**。
2. 在 **Build and deployment** 下的 **Source** 選擇 **Deploy from a branch**。
3. 在 **Branch** 選擇 `gh-pages` (注意：這個分支會在第一次 Actions 跑完後自動建立，如果還沒看到，請先做步驟 4)。
4. 觸發第一次部署：
   - 隨便修改一個檔案 (如 README) 並 Push 到 `main`。
   - 或者去 **Actions** 分頁，手動觸發 workflow (如果有設定 workflow_dispatch)。
   - 等待 Actions 跑完 (綠色勾勾)，`gh-pages` 分支就會出現。
5. 回到 **Pages** 設定，確認 Branch 選的是 `gh-pages`，然後 Save。

### 步驟 4：瀏覽網站
GitHub Pages 會給您一個網址 (如 `https://yourname.github.io/repo-name/`)。
請點擊該網址即可開始使用！

> **注意**：如果打開網頁是一片白，請確認 `vite.config.js` 中的 `base` 設定是否正確 (`./` 通常通用，但有時需指定 repo 名稱)。

---

## 常見問題

### Q1: 為什麼訂單提交後顯示「提交失敗」？
**A**: 請確認：
1. `.env` 檔案中的 `VITE_GOOGLE_APP_SCRIPT_URL` 是否正確
2. Google Apps Script 是否已部署為「網路應用程式」
3. 部署時「具有存取權的使用者」是否設定為「任何人」

### Q2: Google Sheets 中的數據沒有更新？
**A**: 請確認：
1. Apps Script 的授權是否完成
2. 在 Apps Script 編輯器中點擊「執行」→ 選擇 `doGet` 函式測試是否有錯誤

### Q3: 毛利率顯示為 #DIV/0! 錯誤？
**A**: 請確認「單品定價」工作表的毛利率欄位使用公式：`=IF(C2>0, (C2-B2)/C2, 0)`

### Q4: 剩餘庫存沒有自動計算？
**A**: 請確認「庫存」工作表的剩餘庫存欄位使用公式：`=B2-C2`

---

## 專案結構

```
Inventory-Management-System/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx      # 首頁
│   │   ├── Dashboard.jsx        # 庫存概覽
│   │   ├── OrderForm.jsx        # 建立訂單
│   │   ├── OrderManager.jsx     # 訂單管理
│   │   ├── CostManager.jsx      # 成本管理
│   │   └── PricingManager.jsx   # 定價管理
│   ├── App.jsx                  # 主應用程式
│   └── index.css                # Muji 風格樣式
├── GAS-code.gs                  # Google Apps Script 後端代碼
├── .env                         # 環境變數（需自行建立）
└── README.md                    # 本文件
```

---

## 授權

MIT License

---

## 支援

如有問題或建議，歡迎開 Issue 討論。
