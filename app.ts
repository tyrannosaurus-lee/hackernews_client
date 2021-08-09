type Store = {
    currentPage : number;
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
    read?: boolean;
}

type NewsDetail = {
    id: number;
    time_ago: string;
    title: string;
    url: string;
    user: string;
    content: string;
    comments: [];
}

type NewsCommnet = {

}

const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'http://api.hnpwa.com/v0/item/@id.json'

const store: Store = {
    currentPage: 1,
    feeds: [],
}

// 호출할 때 기술된 타입이 그대로 T로 넘어옴
// 리턴값을 AjaxResponse로 쓴다는 뜻
// 제네릭 : 호출하는 쪽에서 유형을 명시해 주면 그 유형을 받아서 그대로 getData에서 반환 유형으로 사용하겠다
function getData<AjaxResponse>(url: string): AjaxResponse {
    ajax.open('GET', url, false);
    ajax.send();
    // 결국 JSON.parse(ajax.response)한 것을 반환하는 유형이 바로 이 T 유형, 리턴 유형이라는 뜻
    return JSON.parse(ajax.response);
}

function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
    for(let i=0; i < feeds.length; i++){
        feeds[i].red = false;
    }
    return feeds;
}

// 리턴 값이 없을 때 : void
function updateView(html: string): void {
    if (container) {
        container.innerHTML = html;
    } else {
        console.error('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
    }
}

// 글 목록
function newsFeed(): void {
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
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 text-2xl text-gray-700">
                {{__news_feed__}}
            </div>
        </div>
    `;

    if (newsFeed.length === 0) {
        // 응답으로 받을 원하는 타입은 NewsFeed의 배열타입
        newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL));
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
    template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
    template = template.replace('{{__next_page__}}', String(store.currentPage + 1));

    updateView(template);
}


// 글 내용
function newsDetail(): void {
    const id = location.hash.substr(7);
    // 제네릭 : <NewsDetail>로 NewsDetail을 타입으로 주면 응답 값으로 넘어옴. API는 해당하는 API를 이용해서 관련 스펙이 넘어옴.
    // 제네릭 : 보통 T, 약어로 쓰기도 하고 명시적으로 어떤 유형으로 좀 길게 표현하기도 함.
    const newsContent = getData<NewsDetail>(CONTENT_URL.replace('@id', id));
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

    updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

// 인자 called는 안쓰기로 해요~
// called 값을 사용할 comments 안에 level
function makeComment(comments: NewsComment[]): string{
    const commentString = [];

    // comments[i] 중복 제거 : comments[i]가 많을수록 comments[i]가 계속 반복됨.
    // comments[i]를 변수 하나 만들어서 거기에 넣고 그 변수를 사용하기
    for(let i=0; i < comments.length; i++) {
        const comment: NewsCommetn = comments[i];
        commentString.push(`
            <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
                <div class="text-gray-400">
                    <i class="fa fa-sort-up mr-2"></i>
                    <strong>${comment.user}</strong> ${comment.time_ago}
                </div>
                <p class="text-gray-700">${comment.content}</p>
            </div>
        `);

        // 끝을 알 수 없는 구조인 경우에 자주 사용되는 테크닉!!!
        // 재귀호출 : 함수가 자기 자신을 호출하는 것
        if(comment.comments.length > 0) {
            commentString.push(makeComment(comment.comments));
        }
        // 없을때까지 반복
    }
    return commentString.join('');
}

// 라우터
function router(): void {
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