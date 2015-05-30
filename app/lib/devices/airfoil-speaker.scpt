
if command is "get" then
	
	my getInfo()
	
else if command is "set" then
	
	tell application "Airfoil"
		
		try
			set sp to first speaker whose id is hardwareId
			connect to sp
			set (volume of sp) to vol / 100
		end try
		
	end tell
	
	my getInfo()

else if command is "connect" then

	tell application "Airfoil"
		
		try
			set sp to first speaker whose id is hardwareId
			connect to sp
		end try
		
	end tell

	my getInfo()
	
end if


on getInfo()
	
	tell application "Airfoil"
		
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
			set output to output & "		\"name\": \"" & name of sp & "\",
"
			set output to output & "		\"volume\": \"" & volume of sp * 100 & "\"
"
			set output to output & "	}"
			set m to true
		end repeat
		set output to output & "]}"
		
	end tell
	
end getInfo