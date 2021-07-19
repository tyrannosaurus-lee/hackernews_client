const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'http://api.hnpwa.com/v0/item/@id.json'

// 반복되는 ajax.open(), ajax.send(), JSON.parse(ajax.response) 코드를 함수로 묶는다.
function getData(url) {
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
}

// 반복되는 ajax.open(), ajax.send()를 getData함수에 넣는다.
// ajax.open('GET', NEWS_URL, false);
// ajax.send();

// 반복되는 JSON.parse(ajax.response)를 getData함수에 넣는다.
// const newsFeed = JSON.parse(ajax.response);
const newsFeed = getData(NEWS_URL);

const ul = document.createElement('ul');

window.addEventListener('hashchange', function(){
    const id = location.hash.substr(1);

    // 반복되는 ajax.open(), ajax.send()를 getData함수에 넣는다.
    // ajax.open('GET', CONTENT_URL.replace('@id', id), false);
    // ajax.send();

    // 반복되는 JSON.parse(ajax.response)를 getData함수에 넣는다.
    // const newsContent = JSON.parse(ajax.response);
    const newsContent = getData(CONTENT_URL.replace('@id', id));

    const title = document.createElement('h1');
    title.innerHTML = newsContent.title;
    content.appendChild(title);
    console.log(newsContent);
});

for(let i=0; i<10; i++){
    const div = document.createElement('div');
    const li = document.createElement('li');
    const a = document.createElement('a');

    div.innerHTML =`
    <li>
        <a href="#${newsFeed[i].id}">
        ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
    </li>
    `;

    ul.appendChild(div.firstElementChild);
}

container.appendChild(ul);
container.appendChild(content);