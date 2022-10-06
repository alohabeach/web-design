const API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
const container = document.getElementsByClassName('container1')[0];
const updateBtn = document.getElementById('update');
const storeBtn = document.getElementById('store');

container.style['margin-top'] = '75px';

const removeChildren = (element) => {
    let child = element.firstElementChild;
    while (child) {
        child.remove();
        child = element.firstElementChild;
    }
};

const getISS = async _ => {
    removeChildren(container);

    const loading = document.createElement('p');
    loading.innerHTML = 'Loading...';
    container.appendChild(loading);

    const response = await fetch(API_URL);
    const data = await response.json();

    removeChildren(container);
    for (const [index, value] of Object.entries(data)) {
        const info = document.createElement('p');
        info.innerHTML = `${index}: ${typeof value == 'number' ? Math.floor(value) : value}`;
        container.appendChild(info);
    }
};

getISS();
updateBtn.addEventListener('click', getISS);