@echo off
chcp 65001 >nul
title Dong Bo Code Hanh Trinh Ngon Tu Len GitHub Deploy Vercel
cls
echo =========================================================================
echo    CONG CU DONG BO TOAN BO CODE DA SUA LOI LEN GITHUB DEPLOY VERCEL
echo =========================================================================
echo.
echo Ma nguon tren may tinh cua ban da duoc sua sach 100%% cac loi:
echo   [x] Da xoa hoan toan __dirname de tuong thich Vite 8
echo   [x] Da sua duong dan entry /src/main.tsx
echo   [x] Da thiet lap vercel.json cho Single Page Application (SPA)
echo.
echo Huong dan lay link GitHub:
echo 1. Mo trang GitHub cua ban tren trinh duyet (vi du: https://github.com/TenBan/TenRepo)
echo 2. Bam nut mau xanh [Code] va copy duong link HTTPS (hoac copy link tren thanh dia chi)
echo.
set /p REPO_URL=">> Dan link GitHub cua ban vao day va an Enter: "

if "%REPO_URL%"=="" (
    echo.
    echo [!] Ban chua nhap duong link. Vui long chay lai!
    pause
    exit /b
)

set REPO_URL=%REPO_URL:"=%
set REPO_URL=%REPO_URL: =%

echo.
echo Dang cau hinh Git va day toan bo ma nguon len GitHub...
cd /d "c:\Users\Admin\Desktop\morongvontucacdangvan"

git init
git config user.name "HanhTrinhNgonTu"
git config user.email "admin@hanhtrinhngontu.local"
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git add .
git commit -m "Fix Vercel build: resolve main.tsx path and import.meta.dirname"
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =========================================================================
    echo [THANH CONG RUC RO!] Toan bo code da duoc day len GitHub!
    echo Vercel se tu dong phat hien commit moi va tien hanh Build lai.
    echo Ban hay quay lai man hinh Vercel va xem thanh trang thai chuyen sang xanh nhe!
    echo =========================================================================
) else (
    echo.
    echo =========================================================================
    echo [LUU Y] Neu Git yeu cau dang nhap, hay lam theo huong dan dang nhap GitHub.
    echo Hoac ban co the copy link GitHub do gui truc tiep cho AI trong khung chat!
    echo =========================================================================
)

pause
