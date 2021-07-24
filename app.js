const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'http://api.hnpwa.com/v0/item/@id.json'

// 여러 함수에 걸쳐서 접근하게 되는 정보는 함수 바깥쪽으로 빼놓는 것이 필요함
const store = {
    currentPage: 1,
    // 자바스크립트를 이용한 페이징 처리 방법

    // 페이징 파라미터
    // appendEle : Element
    // totalCount : 데이터 총 카운트
    // recordsPerPage : 페이지 데이터 레코드 개수
    // navPage : 페이지 개수
    // currentPage : 현재 페이지
    // sellBoolean : 맨앞, 맨뒤 표현 여부
}

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

    // currentPage가 1일 때는 i값이 0이므로 -1을 해준다.
    // 하나의 페이지의 크기가 결국 10개
    // 10이라는 것은 결국 한 페이지의 단위가 됨
    // 그러니까 페이지가 바뀐다는 건 이 페이지 단위 개수만큼 널뛰기가 되어야 한다는 것
    // for(let i=0; i<10; i++){
    for(let i=(store.currentPage - 1) * 10; i<store.currentPage * 10; i++){
        newsList.push(`
        <li>
            <a href="#/show/${newsFeed[i].id}">
            ${newsFeed[i].title} (${newsFeed[i].comments_count})
            </a>
        </li>
        `);
    }
    newsList.push('</ul>');
    newsList.push(`
        <div>
            <a href="#/page/${store.currentPage > 1 ? store.currentPage - 1 : 1}">이전 페이지</a>
            <a href="#/page/${store.currentPage + 1}">다음 페이지</a>
        </div>
    `)
    // 코드가 한줄일땐 if문 쓰기 부담스러우니 삼항연산자를 사용한다

    container.innerHTML = newsList.join('');
}

const ul = document.createElement('ul');

// 글 내용
function newsDetail(){
    const id = location.hash.substr(7);
    const newsContent = getData(CONTENT_URL.replace('@id', id));
    const title = document.createElement('h1');

    container.innerHTML = `
        <h1>${newsContent.title}</h1>
        <div>
            <a href="#/page/${store.currentPage}">목록으로</a>
        </div>
    `;
}

// 라우터
function router(){
    const routePath = location.hash;

    if(routePath === ''){
        newsFeed();
    } else if (routePath.indexOf('#/page/') >= 0){  // 0보다 작은 값이면 입력으로 주어진 문자열이 없다
        // substr이라고 하는 함수로 반환되는 값은 실제로 숫자가 아니라 문자열이다
        // currentPage는 숫자로 되어 있어야 함
        // store.currentPage = 2;
        store.currentPage = Number(routePath.substr(7));
        newsFeed();
    } else {
        newsDetail();
    }
}

window.addEventListener('hashchange', router);

router();