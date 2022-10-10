const axios = require('axios');
const ytdl = require('ytdl-core');
const { downloadSong } = require('ytdl-mp3');
const Youtube = require('youtube-sr').default;
const path = require('path');

module.exports = class Spotify {
    /**
     * Loads up the spotify api thingy
     */
    constructor() {
        this.SEARCH_URL = 'https://api.spotify.com/v1/search';
        this.ARTIST_URL = 'https://api.spotify.com/v1/artists';
        this.ACCESS_TOKEN_URL = 'https://accounts.spotify.com/api/token';
        this.BASE_YT_VIDEO_URL = 'http://www.youtube.com/watch?v=';
        this.AUDIOS_PATH = path.resolve(__dirname, '../../public/audios/'); 
    }

    /**
     * Takes the spotify info, finds a youtube song that matches, and downloads that
     * @param {String} songName The name of the track to download
     * @param {String} artistName This is just for more specificity
     * @returns {Promise} Returns a promised path to the mp3 file
     */
    download(songName, artistName) {
        return new Promise(async (resolve, reject) => {
            try {
                const video = await Youtube.searchOne(`${songName} ${artistName} audio`).catch(reject);
                if (!video.id) reject(new Error('Track not found'));

                const url = this.BASE_YT_VIDEO_URL + video.id;

                downloadSong(url, { outputDir: path.resolve(__dirname, '../../public/audios') }).catch(reject);

                const videoInfo = await ytdl.getInfo(url);
                const newTitle = videoInfo.videoDetails.title
                    .replace(/\s*[([].*?[)\]]\s*/g, '')
                    .replace(/[^a-z0-9]/gi, '_')
                    .split('_')
                    .filter((e) => e)
                    .join('_')
                    .toLowerCase();

                resolve(`${path.resolve(__dirname, '../../public/audios/' + newTitle)}.mp3`);
            } catch (e) {
                resolve(e);
            }
        });
    }

    /**
     * Search for your favorite tracks on spotify
     * @param {String} query This is the search term
     * @param {Number} limit The max number of tracks to return
     * @returns {Promise} An array of all the tracks that matched the search
     */
    search(query, limit) {
        return new Promise(async (resolve, reject) => {
            const { token_type: type, access_token: token } = await this._getAccessToken();

            const params = new URLSearchParams({
                q: query,
                type: ['track'],
                market: 'US',
                limit: limit,
                offset: 0,
            });

            const result = await axios({
                method: 'GET',
                url: `${this.SEARCH_URL}?${params}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${type} ${token}`,
                },
            });

            let parsedData = this._parse(result.data);
            parsedData = this._populateArtistArt(parsedData);

            resolve(parsedData);
        });
    }

    /**
     * Search for art of your favorite artists
     * @param {String} artistId The id of the artist on spotify
     * @returns {Promise} An array of all the art that matches the artist
     */
    searchArt(artistId) {
        return new Promise(async (resolve, reject) => {
            const { token_type: type, access_token: token } = await this._getAccessToken();

            const result = await axios({
                method: 'GET',
                url: `${this.ARTIST_URL}/${artistId}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${type} ${token}`,
                },
            });

            resolve(result.data);
        });
    }

    /**
     * Gets the Athorization token for the spotify api
     * @returns {Object} An object that contains the access token info
     */
    async _getAccessToken() {
        return new Promise(async (resolve, reject) => {
            const result = await axios({
                method: 'POST',
                url: this.ACCESS_TOKEN_URL,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                params: {
                    grant_type: 'client_credentials',
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
                },
            });

            resolve(result.data);
        });
    }

    /**
     * Will add a picture of the artist to the given parsed spotify track data
     * @param {*} parsedData The simplified spotify list of track data
     */
    async _populateArtistArt(parsedData) {
        for (let trackI = 0; trackI < parsedData.length; trackI++) {
            const track = parsedData[trackI];

            for (let artistI = 0; artistI < track.artistsInfo.length; artistI++) {
                const artist = track.artistsInfo[artistI];

                let artistId = artist.url.split('/');
                artistId = artistId[artistId.length - 1];

                const art = await this.searchArt(artistId);
                artist.imageUrl = art.images.length > 0 ? art.images[0].url : track.coverUrl;
            }
        }

        return parsedData;
    }

    /**
     * Will change the hard to use spotify data to a more user friendly one
     * @param {Object} data The original spotify data object
     * @returns {Array} List of tracks with easy to parse info
     */
    _parse(data) {
        const tracks = [];

        try {
            for (const item of data.tracks.items) {
                const info = {
                    songUrl: item.external_urls.spotify,
                    songName: this._fixName(item.name),
                    albumUrl: item.album.external_urls.spotify,
                    albumName: item.album.name,
                    artistsInfo: [],
                    coverUrl: item.album.images[1].url,
                    releaseYear: item.album.release_date.split('-')[0],
                };

                for (const artist of item.artists) {
                    info.artistsInfo.push({
                        name: artist.name,
                        url: artist.external_urls.spotify,
                    });
                }

                tracks.push(info);
            }
        } catch (e) {
            console.error(e);
        }

        return tracks;
    }

    _fixName(name) {
        // get rid of features in the title
        let fixedName = name.replace(/ *\([^)]*\) */g, '');

        return fixedName;
    }
}