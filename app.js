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

const newsFeed = getData(NEWS_URL);

const ul = document.createElement('ul');

// 내용 화면으로 진입
window.addEventListener('hashchange', function(){
    const id = location.hash.substr(1);
    const newsContent = getData(CONTENT_URL.replace('@id', id));

    const title = document.createElement('h1');
    //  문자열 처리 방식으로 화면에 UI 구성. div하위를 싹 다 날려벌임
    // 이전 화면이 사라지고 현재 사용자가 보는 글 내용 화면이 나오게 됨.
    // 목록 화면도  append 하는 구조고 되어 있으면 안됨.
    // container.innerHTML을 다 밀어 넣는 방식으로 바꿈
    container.innerHTML = `
        <h1>${newsContent.title}</h1>
        <div>
            <a href="#">목록으로</a>
        </div>
    `;

    // title.innerHTML = newsContent.title;
    // content.appendChild(title);
});

// 내가 만들고자 하는 문자열 전체 세트를 만들기 위해서는 중간 단계가 많이 필요함
// 이럴땐 배열 사용!!!
const newsList = [];
newsList.push('<ul>');
for(let i=0; i<10; i++){
    // const div = document.createElement('div');

    // div.innerHTML =`
    newsList.push(`
    <li>
        <a href="#${newsFeed[i].id}">
        ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
    </li>
    `);

    // ul.appendChild(div.firstElementChild);
}
newsList.push('</ul>');

// innerHTML에 newsList를 넣을 수 없음. 왜냐하면 innerHTML에는 하나의 문자열이 들어가야 됨.
// 하지만 newsList는 배열.
// 배열을 하나의 문자열로 합치는 기능을 배열이 제공해 줌 = join()
container.innerHTML = newsList.join('');

// 추가하는 코드만 있음. 추가 즉, 기존 걸 유지한다는 것.
// 당연히 목록 화면에서 내용 화면으로 진입했을 때 목록 화면이 유지되고 있는 것.
// 사용자 입장에서는 2개의 화면을 동시에 다 보고 있는 상태가 만들어짐
// 내용화면으로 진입하면 기존의 목록 화면을 다 없앤다. = appendChild를 쓰지 않음
// container.appendChild(ul);
// container.appendChild(content);