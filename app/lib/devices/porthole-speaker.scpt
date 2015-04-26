
if action is "getSpeakers" then
	
	set systemVolume to output volume of (get volume settings)
	
	tell application "Porthole"
		set output to "{\"data\": [
	"
		set m to false
		repeat with sp in speakers as list
			if m then
				set output to output & ",
	"
			end if
			set output to output & "{
"
			set output to output & "		\"hardwareId\": \"" & id of sp & "\",
"
			set output to output & "		\"connected\": \"" & connected of sp & "\",
"
			set output to output & "		\"streaming\": \"" & streaming of sp & "\",
"
			set output to output & "		\"name\": \"" & name of sp & "\",
"
			set output to output & "		\"volume\": \"" & systemVolume & "\"
"
			set output to output & "	}"
			set m to true
		end repeat
		set output to output & "]}"
	end tell
end if


if action is "getSpeaker" then
	tell application "Porthole"
		set sp to (first speaker whose id is speakerId)
		set systemVolume to output volume of (get volume settings)
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
end if 