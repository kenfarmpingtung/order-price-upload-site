# 線上下單網站

這是一個可部署到 GitHub Pages 的靜態下單網站，品牌主題為 Ken's Farm 屏東小農產地直送。

## 功能

- 從 `data/products.json` 讀取商品
- 商品價格與數量選擇
- 訂單資料表單
- Formspree 表單欄位與 hidden 訂單明細
- GitHub Pages 靜態部署

## 更新商品

可以直接開啟 `admin.html` 使用視覺後台修改。

後台可編輯：

- 本週水果區標題
- 商品名稱、價格、單位、描述、照片
- Email、Formspree endpoint、LINE / IG 連結

後台修改後請下載：

- `content.json`
- `products.json`

再放回 `data/` 資料夾覆蓋。

圖片統一放在 `assets/images/`。如果後台選了新圖片，請把同名圖片也上傳到 `assets/images/`。

## 後台操作

後台網址：

`https://kenfarmpingtung.github.io/order-price-upload-site/admin.html`

操作流程：

1. 點文字直接修改。
2. 點商品照片，上傳新圖片預覽。
3. 點商品卡，可在右側修改名稱、價格、單位、描述、照片與是否顯示。
4. 修改 Email、Formspree endpoint、LINE、IG 連結。
5. 按 `Download content.json` 和 `Download products.json`。
6. 到 GitHub repo 的 `data/` 資料夾，把下載的 JSON 上傳覆蓋。
7. 如果有換圖片，到 `assets/images/` 上傳同名圖片。
8. GitHub Pages 會自動更新，通常等待 1-2 分鐘。

注意：GitHub Pages 是靜態網站，後台不能直接寫入 GitHub。下載 JSON 後仍需要手動上傳。

## Formspree

在 `admin.html` 的 Site Settings 填入你的 Formspree endpoint，下載 `content.json` 後覆蓋到 `data/content.json`。沒有設定 Formspree endpoint 時，前台不會送出訂單，也不會開啟 Email 視窗。

## 部署

GitHub Pages 可直接使用根目錄部署，入口檔案為 `index.html`。
