set systemVolume to output volume of (get volume settings)
tell application "Porthole"
	set sp to (first speaker whose id is speakerId)
	set output to "{\"data\": {
"
	set output to output & "	\"hardwareId\": \"" & id of sp & "\",
"
	set output to output & "	\"connected\": \"" & connected of sp & "\",
"
	set output to output & "	\"streaming\": \"" & streaming of sp & "\",
"
	set output to output & "	\"name\": \"" & name of sp & "\",
"
	set output to output & "	\"volume\": \"" & systemVolume & "\"
"
	set output to output & "}}"
end tell


