let tracks = [];
let albums = {};
let token = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function parse_albums() {
    let album_progress = 0;
    for (let i = 0; i < Object.keys(albums).length; i += 20) {
        await sleep(50);
        $.ajax({
            url: 'https://api.spotify.com/v1/albums',
            headers: {'Authorization': 'Bearer ' + token},
            data: {ids: Object.keys(albums).slice(i, i+20).join()},
            error: function(xhr, status, e) {
                console.log('failed to get albums: (' + xhr.status + ') ' + e);
            },
            success: function(data) { 
                for (let k = 0; k < data.albums.length; k++) {
                    console.log(data.albums[k]);
                    albums[data.albums[k].id].genres = data.albums[k].genres
                }
                album_progress += data.albums.length;
                $('#album-progress').text(album_progress);
            }
        });
        return;
    }
}

// For each item in a /me/tracks response, add it to the tracks list and check if we found its album already.
// If not, add the album to the albums dict and go look up its genre(s)
function parse_page(items) {
    items.forEach(function(item) {
        tracks.push(item.track);
        let album = item.track.album;
        if (!(album.id in albums)) {
            albums[album.id] = album;
            $('#album-total').text(Object.keys(albums).length + ' albums');
        }
        $('#progress').text(tracks.length);
    });
}

// Go through all of user's liked songs, check for unique albums and save track data
let parse_library = async function() {
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

    parse_albums();
};

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