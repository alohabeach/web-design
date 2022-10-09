const container = document.getElementsByClassName('container1')[0];
const btn = document.getElementsByClassName('btn')[0];
const vid = document.getElementById('vid');

btn.addEventListener('click', _ => {
    container.remove();
    vid.style.display = '';
    vid.play();
});