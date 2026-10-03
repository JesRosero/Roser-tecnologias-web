$ErrorActionPreference = 'Stop'
try {
 $raiz = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
 $version = & node --version
 if ($LASTEXITCODE -ne 0 -or [int]($version.TrimStart('v').Split('.')[0]) -lt 18) { throw 'Se requiere Node.js 18 o posterior.' }
 $runtime = Join-Path $raiz '.roser-local/administrador/runtime'
 New-Item -ItemType Directory -Path $runtime -Force | Out-Null
 $ignore = Join-Path $raiz '.gitignore'
 $texto = if (Test-Path $ignore) { [IO.File]::ReadAllText($ignore) } else { '' }
 if ($texto -notmatch '(?m)^\.roser-local/\s*$') { [IO.File]::AppendAllText($ignore,"`n.roser-local/`n") }
 Write-Host 'Preparando Administrador Roser. Esta instalacion solo se realiza la primera vez.'
 & npm.cmd install --prefix $runtime --no-audit --no-fund --ignore-scripts=false --save-exact electron@44.5.1
 if ($LASTEXITCODE -ne 0) { throw 'No se pudo descargar la ventana del administrador.' }
 $ejecutable = Join-Path $runtime 'node_modules/electron/dist/electron.exe'
 if (!(Test-Path $ejecutable)) { & node (Join-Path $runtime 'node_modules/electron/install.js'); if ($LASTEXITCODE -ne 0 -or !(Test-Path $ejecutable)) { throw 'La descarga de Electron no se completo.' } }
 $shell = New-Object -ComObject WScript.Shell
 $enlace = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Administrador Roser.lnk'))
 $enlace.TargetPath = Join-Path $env:SystemRoot 'System32/wscript.exe'
 $enlace.Arguments = '"' + (Join-Path $raiz 'Administrador-Roser.vbs') + '"'
 $enlace.WorkingDirectory = $raiz
 $enlace.Description = 'Editar el sitio local de Roser Tecnologias'
 $enlace.IconLocation = (Join-Path $PSScriptRoot 'roser-administrador-transparente.ico') + ',0'
 $enlace.Save()
 exit 0
} catch { Write-Host $_.Exception.Message -ForegroundColor Red; Read-Host 'Pulsa Enter para cerrar'; exit 1 }
