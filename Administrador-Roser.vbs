Option Explicit
Dim sh, fso, raiz, exe, appdir, instalar, codigo, enlace, escritorio
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
raiz = fso.GetParentFolderName(WScript.ScriptFullName)
exe = raiz & "\.roser-local\administrador\runtime\node_modules\electron\dist\electron.exe"
appdir = raiz & "\herramientas\administrador"
If Not fso.FileExists(exe) Then
 instalar = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File " & Chr(34) & appdir & "\instalar.ps1" & Chr(34)
 codigo = sh.Run(instalar, 1, True)
 If codigo <> 0 Or Not fso.FileExists(exe) Then
  MsgBox "No se pudo preparar Administrador Roser. Comprueba que Node.js este instalado y tengas conexion a Internet.", vbExclamation, "Administrador Roser"
  WScript.Quit 1
 End If
End If
' Actualiza el acceso existente sin reinstalar el programa.
On Error Resume Next
escritorio = sh.SpecialFolders("Desktop")
Set enlace = sh.CreateShortcut(escritorio & "\Administrador Roser.lnk")
enlace.TargetPath = sh.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\wscript.exe"
enlace.Arguments = Chr(34) & raiz & "\Administrador-Roser.vbs" & Chr(34)
enlace.WorkingDirectory = raiz
enlace.Description = "Editar el sitio local de Roser Tecnologias"
enlace.IconLocation = appdir & "\roser-administrador-transparente.ico,0"
enlace.Save
On Error GoTo 0
sh.CurrentDirectory = raiz
sh.Run Chr(34) & exe & Chr(34) & " " & Chr(34) & appdir & Chr(34), 0, False
