const container = document.getElementsByClassName('container1')[0];
const btn = document.getElementsByClassName('btn')[0];

btn.addEventListener('click', _ => {
    container.remove();
    const vid = document.getElementById('vid');
    vid.style.display = '';
    vid.play();
});