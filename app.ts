// 타입 알리아스 vs 인터페이스
// 타입 알리아스 :
// 객체 형태의 데이터의 유형 형식을 정의한다.
// 타입이나 인터페이스와 같은 타이핑하는 식별자들은 대문자로 시작하는 표기법을 많이 씀.
type Store = {
    currentPage : number; // 객체와 달리 세미콜론;으로 끝내는게 특징
    // newsFeed가 들어갈 객체 데이터 타입. 이렇게 빈 배열로 타입을 해 놓으면 배열 안에 어떤 게 들어갈지 제약을 하지 못함.
    // 어떤 유형의 데이터가 다 들어갈 수도 있지만 명확하게 어떤 타입의 데이터가 이 배열 안에 들어갈지 기술해주는게 좋음(타입 명시하기)
    // feeds: [];
    // NewsFeed[] : NewsFeed 유형의 데이터가 들어가는 배열이라는 뜻!
    feeds: NewsFeed[];
}

type NewsFeed = {
    id: number;
    comments_count:number;
    title: string;
    url: string;
    user: string;
    time_ago: string;
    poinsts: number;
    // read :
    // 다른 속성과 달리 처음에 네트워크를 통해서 가져왔을 땐 없음.
    // 처음에는 데이터가 없다가 나중에는 있다가. 선택적인 데이터임. 그래서 선택 속성이라고 하는 마킹을 해줄 수 있다.
    // 콜론;과 속성 명 사이에 물음표를 붙여주면 됨.
    read?: boolean;
}

// 프리미티브 타입 vs 객체 타입
// 프리미티브 타입 :
// 문자열, 숫자, boolean, nul, undefined

// 타입 확인 : 마우스 커서를 올려놓으면 관련된 정보를 표시해 줌.
// ex) : string):
// 함수의 인자 괄호 뒤에 콜론은 이 함수의 반환값 타입. |은 또는(유니온 타입). 둘 중 하나가 반환될 수 있다는 뜻.
const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'http://api.hnpwa.com/v0/item/@id.json'

// store 타입은 store에 씀
const store: Store = {
    currentPage: 1,
    feeds: [],
}

function getData(url) {
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
}

// 읽었는지 여부 체크
function makeFeeds(feeds){
    for(let i=0; i < feeds.length; i++){
        feeds[i].red = false;
    }
    return feeds;
}

// view update : ex)container.innerHTML에다가 HTML문자열을 넣는 것.

// 타입가드 : 타입을 방어한다.
// 어떤 유형의 값이 2가지가 들어온 케이스(그중에 1가지는 null인 즉, 데이터가 없는 케이스)에서 무작정 데이터가 당연히 있다고 생각하과 속성을 접근했을 경우,
// 이런 류의 코드들에서 null을 체크해라
function updateView(html) {
    // 코드 상으로 null이 들어가 있지 않은 경우에만 innerHTML에 접근해라
    // if (container != null) 의 축약형
    // if (container != null) {
    if (container) {
        container.innerHTML = html;
    } else {
        console.error('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
    }
}

// 글 목록
function newsFeed(){
    // getData를 통해서 무조건 호출되면 새로운 목록을 갖고 옴.
    // const newsFeed = getData(NEWS_URL);
    let newsFeed = store.feeds;

    const newsList = [];
    let template = `
        <div class="bg-gray-600 min-h-screen">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex justify-start">
                            <h1 class="font-extrabold">Hacker News</h1>
                        </div>
                        <div class="items-center justify-end">
                            <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                                Previous
                            </a>
                            <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                                Next
                            </a>
                        /div>
                    </div>
                </div>
            </div>
            <div class="p-4 text-2xl text-gray-700">
                {{__news_feed__}}
            </div>
        </div>
    `;

    // 최초의 한 번은 getData해서 가져와야 함
    if (newsFeed.length === 0) {
        // = 을 연속해서 쓸 수 있음
        newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
    }

    for(let i=(store.currentPage - 1) * 10; i<store.currentPage * 10; i++){
        newsList.push(`
        <div class="p-6 ${newsFeed[i].read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
                <div class="flex-auto">
                    <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>
                </div>
                <div class="text-center text-sm">
                    <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
                </div>
            </div>
            <div class="flex mt-3">
                <div class="grid grid-cols-3 text-sm text-gray-500">
                    <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
                    <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
                    <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
                </div>
            </div>
        </div>
        `);
    }

    template = template.replace('{{__news_feed__}}', newsList.join(''));
    template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1);
    template = template.replace('{{__next_page__}}', store.currentPage + 1);

    updateView(template);
}


// 글 내용
function newsDetail(){
    const id = location.hash.substr(7);
    const newsContent = getData(CONTENT_URL.replace('@id', id));
    const title = document.createElement('h1');
    let template = `
        <div class="bg-gray-600 min-h-screen pb-8">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                <div class="flex justify-between items-center py-6">
                    <div class="flex justify-start">
                    <h1 class="font-extrabold">Hacker News</h1>
                    </div>
                    <div class="items-center justify-end">
                    <a href="#/page/${store.currentPage}" class="text-gray-500">
                        <i class="fa fa-times"></i>
                    </a>
                    </div>
                </div>
                </div>
            </div>

            <div class="h-full border rounded-xl bg-white m-6 p-4 ">
                <h2>${newsContent.title}</h2>
                <div class="text-gray-400 h-20">
                    ${newsContent.content}
                </div>

                {{__comments__}}

            </div>
        </div>
    `;

    for (let i = 0; i < store.feeds.length; i++){
        if (store.feeds[i].id === Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }

    function makeComment(comments, called = 0){
        const commentString = [];

        for(let i=0; i < comments.length; i++) {
            commentString.push(`
                <div style="padding-left: ${called * 40}px;" class="mt-4">
                    <div class="text-gray-400">
                        <i class="fa fa-sort-up mr-2"></i>
                        <strong>${comments[i].user}</strong> ${comments[i].time_ago}
                    </div>
                    <p class="text-gray-700">${comments[i].content}</p>
                </div>
            `);

            // 끝을 알 수 없는 구조인 경우에 자주 사용되는 테크닉!!!
            // 재귀호출 : 함수가 자기 자신을 호출하는 것
            if(comments[i].comments.length > 0) {
                commentString.push(makeComment(comments[i].comments, called + 1));
            }
            // 없을때까지 반복
        }
        return commentString.join('');
    }

    updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

// 라우터
function router(){
    const routePath = location.hash;

    if(routePath === ''){
        newsFeed();
    } else if (routePath.indexOf('#/page/') >= 0){
        store.currentPage = Number(routePath.substr(7));
        newsFeed();
    } else {
        newsDetail();
    }
}

window.addEventListener('hashchange', router);

router();