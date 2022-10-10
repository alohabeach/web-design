const container2 = document.getElementsByClassName('container2')[0];
const container3 = document.getElementsByClassName('container3')[0];
const controls = document.getElementById('controls');

const bg = document.getElementById('bg');
const trackBG = document.getElementById('trackBG');
const songElement = document.getElementById('song');
const artistElement = document.getElementById('artist');
const albumElement = document.getElementById('album');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const beginBtn = document.getElementById('beginBtn');

class AudioVisualizer {
    constructor() {
        const { canvas, ctx } = this._makeCanvas();
        this.canvas = canvas;
        this.ctx = ctx;
        this.audio = this._newAudio();
        this.analyser = this._newAnalyser(this.audio);
        songElement.textContent = '--';
        artistElement.textContent = '';
        albumElement.textContent = '';

        window.addEventListener('beforeunload', (e) => {
            if (this.audio.src.length > 0) {
                this._unload(this.audio.src);
            }
        });
    }

    _error(songInfo) {
        setTimeout(_ => {
            songElement.textContent = songInfo.songName;
            songElement.href = songInfo.songUrl;
        }, 3000);

        songElement.textContent = 'Error!';
    }

    _unload(source) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source }),
        };

        fetch('/audio/api/delete', options);
    }

    load(songInfo) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.audio.src.length > 0) {
                    this._unload(this.audio.src);
                }

                const params = new URLSearchParams({
                    songName: songInfo.songName,
                    artistName: songInfo.artistsInfo[0].name,
                });
                const response = await fetch('/audio/api/download?' + params).catch(console.error);
                if (response.status != 200) {
                    this._error(songInfo);
                    return reject('Error in downloading');
                }

                const fileName = (await response.json()).fileName;

                await this._until(async _ => {
                    const response = await fetch('/audios/' + fileName);
                    return response.status == 200;
                });

                setTimeout(_ => {
                    this.audio.src = '/audios/' + fileName;
                    this.audio.play();
                }, 500);

                this.showAudio();

                $('#bg').fadeTo(500, 0);
                $('#trackBG').fadeTo(500, 0);
                setTimeout(_ => {
                    bg.src = songInfo.artistsInfo[0].imageUrl;
                    trackBG.src = songInfo.coverUrl;
                    $('#bg').fadeTo(500, 1);
                    $('#trackBG').fadeTo(500, 1);
                }, 400);

                songElement.textContent = songInfo.songName;
                songElement.href = songInfo.songUrl;

                for (let i = 0; i < songInfo.artistsInfo.length; i++) {
                    artistElement.textContent += songInfo.artistsInfo[i].name

                    if (i < songInfo.artistsInfo.length - 1) {
                        artistElement.textContent += ', ';
                    }
                }
                artistElement.href = songInfo.artistsInfo[0].url;

                albumElement.textContent = `${songInfo.albumName} • ${songInfo.releaseYear}`;
                albumElement.href = songInfo.albumUrl;

                resolve();
            } catch (e) {
                this._error(songInfo);
                reject(e);
            }
        });
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    setVolume(num) {
        this.audio.volume = num;
    }

    getPosition() {
        return this.audio.currentTime;
    }

    seek(num) {
        this.audio.currentTime = num;
    }

    showAudio() {
        this.analyser.fftSize = Math.pow(2, 12);
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.rainbowCount = 0;

        if (!this.animationLoaded) {
            this.animationLoaded = true;
            this._animate();
        }
    }

    _animate() {
        if (this.audio.src.length == 0) return requestAnimationFrame(_ => this._animate());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const barWidth = this.canvas.width / this.bufferLength;
        this.rainbowCount += 0.007;
        this.analyser.getByteFrequencyData(this.dataArray);
        let xPos = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = this.dataArray[i];
            const { r, g, b } = this._HSVtoRGB(this.rainbowCount * 35 % 255 / 255, 1, 1);
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fillRect(xPos, this.canvas.height - barHeight, barWidth, barHeight);
            xPos += barWidth;
        }

        requestAnimationFrame(_ => this._animate());
    }

    _newAnalyser(audio) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let audioSource;
        let analyser;

        audioSource = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);

        return analyser;
    }

    _newAudio() {
        const audio = new Audio();
        audio.volume = 0.5;
        audio.addEventListener('ended', audio.play);

        return audio;
    }

    _makeCanvas() {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.style.position = 'absolute';
        canvas.style.margin = '0';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style['z-index'] = -1;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.addEventListener('resize', _ => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        return { canvas, ctx: canvas.getContext('2d') };
    }

    _HSVtoRGB(h, s, v) {
        let r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    _until(conditionFunction) {
        const poll = async (resolve) => {
            if (await conditionFunction()) resolve();
            else setTimeout(_ => poll(resolve), 400);
        }

        return new Promise(poll);
    };
}

let visualizer;
beginBtn.addEventListener('click', _ => {
    container3.remove();
    container2.style.display = 'flex';
    controls.style.display = 'flex';
    visualizer = new AudioVisualizer();
});

let debounce;
const searchSong = async _ => {
    if (!visualizer || debounce) return;
    debounce = true;

    try {
        songElement.textContent = 'Loading...';
        songElement.href = '';
        artistElement.textContent = '';
        artistElement.href = '';
        albumElement.textContent = '';
        albumElement.href = '';
        
        const params = new URLSearchParams({ q: searchInput.value });
        const response = await fetch('/audio/api/search?' + params);
        const songInfo = await response.json();
        await visualizer.load(songInfo[0]);
    } catch (e) {
        console.error(e);
    } finally {
        debounce = false;
    }
};

searchBtn.addEventListener('click', searchSong);
document.addEventListener('keydown', (key) => {
    if (key.code == 'Enter') searchSong();
});