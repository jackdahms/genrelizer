let tracks = [];
let artists = {};
let token = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function parse_artists() {
    let artist_progress = 0;
    let size = 50;
    for (let i = 0; i < Object.keys(artists).length; i += size) {
        await sleep(50);
        $.ajax({
            url: 'https://api.spotify.com/v1/artists',
            headers: {'Authorization': 'Bearer ' + token},
            data: {ids: Object.keys(artists).slice(i, i+size).join()},
            error: function(xhr, status, e) {
                console.log('failed to get artists: (' + xhr.status + ') ' + e);
            },
            success: function(data) { 
                for (let k = 0; k < data.artists.length; k++) {
                    artists[data.artists[k].id].genres = data.artists[k].genres
                }
                artist_progress += data.artists.length;
                $('#artist-progress').text(artist_progress);
            }
        });
    }
}

// For each item in a /me/tracks response, add it to the tracks list and check if we found its artists already.
// If not, add the artists to the artists dict and go look up its genre(s)
function parse_page(items) {
    items.forEach(function(item) {
        tracks.push(item.track);
        for (artist_key in item.track.artists) {
            let artist = item.track.artists[artist_key];
            if (!(artist.id in artists)) {
                artists[artist.id] = artist;
                $('#artist-total').text(Object.keys(artists).length + ' artists');
            }
        }
        $('#progress').text(tracks.length);
    });
}

// Go through all of user's liked songs, check for unique artists and save track data
async function parse_library() {
    var total = null

    // Get the first page non-async
    $.ajax({
        url: 'https://api.spotify.com/v1/me/tracks',
        headers: {'Authorization': 'Bearer ' + token},
        async: false,
        data: {limit: 50},
        error: function(xhr, status, e) {
            console.log('failed in first synced library request: (' + status + ') ' + e);
        },
        success: function(data) { 
            total = data.total;
            $('#total').text(total);
            parse_page(data.items);
        }
    });
    
    for (let offset = 50; offset < total; offset += 50) {
        await sleep(100); // give spotify a little rest (haha get it? REST? HA)
        // Get remaining songs in library
        $.ajax({
            url: 'https://api.spotify.com/v1/me/tracks',
            headers: {'Authorization': 'Bearer ' + token},
            data: {
                limit: 50,
                offset: offset
            },
            error: function(xhr, status, e) {
                console.log('failed in library request: (' + status + ') ' + e + ', offset=' + offset);
            },
            success: function(data) {parse_page(data.items);}
        });
    }

    while (tracks.length < total) {
        await sleep(200);
    }

    parse_artists();
}

$(function() {

    // Get parameters from URL
    let hash = window.location.hash
        .substring(1)
        .split('&')
        .reduce(
            function (initial, item) {
                if (item) {
                    let parts = item.split('=');
                    initial[parts[0]] = decodeURIComponent(parts[1]);
                }
                return initial;
            }, 
            {}
        );
    //window.location.hash = '';
    token = hash.access_token;

    if (token) {
        $('#sign-in').hide();
        $('#stats').show();
        parse_library();
    }

    $('#sign-in').click(function() {
        let auth = 'https://accounts.spotify.com/authorize';
        let client = 'a137fe6ce53c48129ddf8f4359a12038';
        let redirect = 'https://jackdahms.github.io/genrelizer';
        let scopes = [
            'user-library-read'
        ];
        window.location = `${auth}?client_id=${client}&redirect_uri=${redirect}&scope=${scopes.join('%20')}&response_type=token&show_dialog=True`;
    })
});