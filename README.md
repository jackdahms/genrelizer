# genrelizer
/ˈZHänrəlīzər/ Create genre playlists from your Spotify liked songs

### TODO
1. Handle access denied (https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow)
2. Uncomment hash removal
3. Include in the blurb a gentle note about why this is so difficult from an API standpoint (no genres for albums, spotify should have this information, they potentially want to make it harder for others to make their own playlists)
    - https://github.com/spotify/web-api/issues/157
        - Spotify has this information, someone suspects they want it to be harderd for others to make their own playlists
    - https://github.com/spotify/web-api/issues/426 
        - Album genres used to be there! They deleted all genres but left the field in the API. 
    - https://community.spotify.com/t5/Content-Questions/Various-questions-about-genres-assigned-to-songs-albums/td-p/4714455
        - support post says genres are assigned on a song by song basis by the artist
4. Brainstorm ways of genre classification for album or for artists with missing information?
5. https://developer.spotify.com/documentation/web-api/reference/browse/get-recommendations/ is where to look for the hardware playlist app idea
