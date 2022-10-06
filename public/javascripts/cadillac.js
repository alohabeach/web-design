const btn = document.getElementsByClassName('btn')[0];

btn.addEventListener('click', _ => {
    const vid = document.getElementById('vid');
    vid.style.display = '';
    vid.play();
});