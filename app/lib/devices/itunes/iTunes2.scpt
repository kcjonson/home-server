


if command is "get" then

	my getInfo()

else if command is "set" then

	tell application "iTunes"
		
		try
			set the sound volume to volume
		end try

		try
			get state
			set playerState to player state
			if state is "playing" and player state is not "playing" then
				play
			end if
			if state is "paused" and player state is not "paused" then
				pause
			end if
		end try

		try 
			play playlist named plist
		end try
			

	end tell

	my getInfo()

end if



on getInfo()

tell application "iTunes"
	
	set trackName to (get name of current track)
	set trackArtist to (get artist of current track)
	set trackAlbum to (get album of current track)
	set playerState to player state
	set trackPlaylist to current playlist
	set currentVol to sound volume
	
	set output to "{\"data\": {
	"
	set output to output & "	\"state\": \"" & playerState & "\",
	"
	set output to output & "	\"volume\": \"" & currentVol & "\",
	"
	set output to output & "	\"name\": \"" & trackName & "\",
		"
	set output to output & "	\"artist\": \"" & trackArtist & "\",
		"
	set output to output & "	\"playlist\": \"" & name of trackPlaylist & "\",
		"
	set output to output & "	\"album\": \"" & trackAlbum & "\"
		"
	set output to output & "}
"
	set output to output & "}"
	
end tell

end getInfo


