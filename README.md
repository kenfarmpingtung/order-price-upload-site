# 線上下單網站

這是一個可部署到 GitHub Pages 的靜態下單網站，品牌主題為 Ken's Farm 屏東小農產地直送。

## 功能

- 從 `data/products.json` 讀取商品
- 商品價格與數量選擇
- 訂單資料表單
- Formspree 表單欄位與 hidden 訂單明細
- GitHub Pages 靜態部署

## 更新商品

修改 `data/products.json`，並替換 `images/` 內的商品圖片即可更新頁面。

## Formspree

在 `app.js` 將 `FORMSPREE_ENDPOINT` 改成你的 Formspree endpoint 後，訂單會送到 Formspree 設定的 Email。

## 部署

GitHub Pages 可直接使用根目錄部署，入口檔案為 `index.html`。
