const img = document.getElementById('img');
const description = document.getElementById('description');
const input = document.getElementsByClassName('input')[0];
const btn = document.getElementsByClassName('btn')[0];

const validTypes = [
    'breakfast',
    'lunch',
    'dinner',
];

const prefixes = [
    'crazy',
    'weird',
    'unusual',
    'normal',
    'wacky',
    'interesting',
    'disgusting',
    'cute',
    'gross',
    'fancy',
    'restaurant',
    'delicious',
];

const debounce = (toggle) => {
    btn.disabled = toggle;
    if (toggle) {
        img.src = 'https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif';
        description.innerHTML = '';
    }
};

const validateInput = _ => {
    return validTypes.find(e => e == input.value);
};

const newLunch = _ => {
    debounce(true);
    if (!validateInput()) {
        debounce(false);
        img.src = 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png';
        description.innerHTML = '';
        return alert(`Please input one of the following:\n\n${validTypes.reduce((a, b) => `${a}, ${b}`)}`)
    };

    const xhr = new XMLHttpRequest();

    xhr.onload = _ => {
        if (xhr.status >= 400) return xhr.onerror(xhr.statusText);

        const result = JSON.parse(xhr.response);

        img.src = result.url;
        description.innerHTML = result.title;
        description.setAttribute('href', result.source);
        debounce(false);
    };

    xhr.onerror = (err) => {
        console.error(err);
        img.src = 'https://cdn0.iconfinder.com/data/icons/shift-interfaces/32/Error-512.png';
        description.innerHTML = 'Something went wrong!';
        description.setAttribute('href', 'https://youtu.be/dQw4w9WgXcQ');
        debounce(false);
    }

    xhr.open('GET', `http://localhost:3000/week3?type=${prefixes[Math.floor(Math.random() * prefixes.length)]}+${input.value}`);
    xhr.send();
};

btn.addEventListener('click', newLunch);
document.addEventListener('keypress', (input) => {
    if (input.key == 'Enter') newLunch();
});