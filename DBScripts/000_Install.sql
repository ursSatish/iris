PRINT 'Setting Local Variable for setting the install'
:setvar path "G:\GIT\iris\DBScripts"
PRINT '01A_Setup_DropAllObject.sql'
:r $
(path)"\01A_SetupDropAllObject.sql"
