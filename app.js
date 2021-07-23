const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'http://api.hnpwa.com/v0/item/@id.json'

function getData(url) {
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
}

// 글 목록
function newsFeed(){
    const newsFeed = getData(NEWS_URL);
    const newsList = [];
    newsList.push('<ul>');
    for(let i=0; i<10; i++){
        newsList.push(`
        <li>
            <a href="#${newsFeed[i].id}">
            ${newsFeed[i].title} (${newsFeed[i].comments_count})
            </a>
        </li>
        `);
    }
    newsList.push('</ul>');

    container.innerHTML = newsList.join('');
}

const ul = document.createElement('ul');

// 글 내용
function newsDetail(){
    const id = location.hash.substr(1);
    const newsContent = getData(CONTENT_URL.replace('@id', id));
    const title = document.createElement('h1');

    container.innerHTML = `
        <h1>${newsContent.title}</h1>
        <div>
            <a href="#">목록으로</a>
        </div>
    `;
}

// 라우터
// 화면이 전환되어야 할 때(hashchange) 라우터가 판단해서 해당하는 화면으로 전환시킴
function router(){
    const routePath = location.hash;   // 화면을 전환하는 용도의 값

    // 라우터 값을 가지고 내가 현재 목록과 내용중 어떤것을 표시할지 판단해야함
    if(routePath === ''){
        // routePath에 빈 문자열이면 location.hash에 #이 들어있음
        // locatiohn.hash에 #만 있을 경우 빈 값을 반환하여 참
        newsFeed();
    } else {
        newsDetail();
    }
}

// 해시가 바뀔 때마다 라우터가 동작함
window.addEventListener('hashchange', router);

router();