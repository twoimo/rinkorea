  
@echo off  
echo Fixing createPortal issues...  
powershell -Command "Get-Content 'src\components\products\DeleteConfirmModal.tsx' | ForEach-Object { $_ -replace 'createPortal\(', 'createPortal(' -replace '\s+\);?\s*$', ', document.body);' } | Set-Content 'src\components\products\DeleteConfirmModal.tsx'"  
echo Fixed DeleteConfirmModal 
