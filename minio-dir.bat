@echo off
:: ============================================================
:: Zengineering — Explorateur de fichiers MinIO (equivalent dir)
:: ============================================================
:: Usage :
::   minio-dir.bat              -> liste tout le bucket
::   minio-dir.bat inbox        -> liste les emails entrants
::   minio-dir.bat projects/    -> liste par projet
:: ============================================================

set PATH_ARG=%~1
if "%PATH_ARG%"=="" (
    echo.
    echo === Contenu du bucket zengineering-files ===
    docker exec zengineering-minio mc ls --recursive local/zengineering-files/
    echo.
    echo === Taille totale ===
    docker exec zengineering-minio mc du local/zengineering-files/
) else (
    echo.
    echo === Contenu de : zengineering-files/%PATH_ARG% ===
    docker exec zengineering-minio mc ls --recursive local/zengineering-files/%PATH_ARG%
)

echo.
echo Console Web MinIO : http://localhost:9001  (login: minioadmin / minioadmin)
pause
