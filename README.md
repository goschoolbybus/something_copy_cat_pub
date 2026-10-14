# 拍貼秀 Personal（自己用版本）

一個超簡單嘅活動照片即時分享工具，類似 photo-show.com，專為自己婚禮／活動用。

## 功能

- 建立活動 → 自動產生 QR Code
- 賓客掃碼即可上傳照片（唔使註冊、唔使裝 App）
- 即時照片牆（輪播 / 網格），適合投影
- 活動後相簿下載

## 快速開始（約 15–20 分鐘）

### 1. 註冊免費帳戶

1. **Supabase**（後端 + 儲存）  
   去 https://supabase.com → 註冊 → New Project  
   - 記住 Project URL 同 anon public key（Settings → API）

2. **Vercel**（免費部署）  
   去 https://vercel.com → 用 GitHub 登入即可

### 2. 設定 Supabase 資料庫

去 Supabase Dashboard → SQL Editor → 執行以下 SQL：

```sql
-- 建立 events 表
create table events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  admin_token text not null,
  created_at timestamptz default now()
);

-- 建立 photos 表
create table photos (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  url text not null,
  storage_path text not null,
  caption text,
  created_at timestamptz default now()
);

-- 開啟 Realtime
alter publication supabase_realtime add table photos;

-- 建立 Storage bucket
-- 去 Storage → New bucket → 名稱填 photos → Public bucket 打勾
```

之後去 **Storage → photos → Policies**，加入以下政策（允許任何人上傳同讀取，適合自己用）：

```sql
-- 允許公開讀取
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'photos' );

-- 允許公開上傳
create policy "Public upload access"
on storage.objects for insert
with check ( bucket_id = 'photos' );
```

（如果想更安全，可以之後再收緊）

### 3. 本機測試（可選）

```bash
# 安裝依賴
npm install

# 複製環境變數
cp .env.local.example .env.local
# 然後編輯 .env.local，填入你的 Supabase URL 同 anon key

# 啟動
npm run dev
```

打開 http://localhost:3000

### 4. 部署到 Vercel（推薦）

1. 把呢個專案推上 GitHub（新建一個 repo）
2. 去 Vercel → New Project → Import 你的 repo
3. 在 Environment Variables 加入：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 anon key
4. Deploy

完成後會得到一個網址，例如 `https://your-project.vercel.app`

### 使用方式

1. 打開你的網站 → 輸入活動名稱 → 建立
2. 進入管理頁，會見到 QR Code
3. 把 QR Code 投影或者印出嚟
4. 用另一部裝置 / 投影機打開「即時照片牆」
5. 賓客掃碼上傳，照片會即時出現
6. 活動後去「相簿」下載

## 注意

- 呢個版本係**自己用**，Storage 同資料庫都用 Supabase 免費額度（夠用好多次活動）
- 免費額度：Supabase 有 1GB 儲存 + 500MB 檔案傳輸／月，自己用綽綽有餘
- 如果想更安全，可以之後加密碼保護管理頁

有問題隨時問我！
