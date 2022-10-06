const container = document.getElementsByClassName('container1')[0];
const btn = document.getElementsByClassName('btn')[0];
const song = new Audio('/audios/POLAND - LIL YACHTY.mp3');
const img = document.getElementById('img');
const gif = document.getElementById('gif');

btn.addEventListener('click', _ => {
    container.remove();
    img.style.display = 'flex';
    gif.style.display = 'flex';
    song.play();
});