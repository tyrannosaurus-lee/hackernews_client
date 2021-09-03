  // 믹스인
  // class 자체를 훨씬 더 독립적인 주체로 바라봄
  // 그래서 class 간의 상하 관계가 묘사되지 않음
  interface Store {
    currentPage: number;
    feeds: NewsFeed[];
  }

  interface News {
    readonly id: number;
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
  }

  interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    // boolean은 writable하니까 readonly가 아님
    read?: boolean;
  }

  interface NewsDetail extends News {
    readonly comments: NewsComment[];
  }

  interface NewsComment extends News {
    readonly comments: NewsComment[];
    readonly level: number;
  }

  const container: HTMLElement | null = document.getElementById('root');
  const ajax: XMLHttpRequest = new XMLHttpRequest();
  const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
  const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
  const store: Store = {
    currentPage: 1,
    feeds: [],
  };

  function applyApiMixins(targetClass: any, baseClasses: any[]): void {
    // 기능을 확장할 대상 class를 먼저 적어준다 - NewsFeedApi

    // 믹스인 관련 코드
    baseClasses.forEach(baseClasses => {
      Object.getOwnPropertyNames(baseClasses.prototype).forEach(name => {
        const descriptor = Object.getOwnPropertyDescriptor(baseClasses.prototype, name);

        if (descriptor) {
          Object.defineProperty(targetClass.prototype, name, descriptor);
        }
      });
    });
  }

  class Api {
    // url: string;
    // ajax: XMLHttpRequest;
    // constructor(url: string) {
    //   this.url = url;
    //   this.ajax = new XMLHttpRequest();
    // }

    // 생성자가 없어졌으니 Request를 받을 때 직접url을 받아줘야 함 (this 삭제)
    // protected getRequest<AjaxResponse>(): AjaxResponse{
    getRequest<AjaxResponse>(url: string): AjaxResponse{
      // this의 ajax가 없으니 내부 변수로 만든다
      const ajax = new XMLHttpRequest();
      // this.ajax.open('GET', this.url, false);
      ajax.open('GET', url, false);
      // this.ajax.send();
      ajax.send();

      return JSON.parse(ajax.response);
    }
  }

  class NewsFeedApi {
    getData() : NewsFeed[] {
      // getRequest의 명세가 바뀌었음
      // 입력 값으로 url을 받게 되어 있음. 그런데 url은 최종적으로 호출하는 쪽에서 줘야 함.
      // 그래서 getData 안에서 직접 NEWS_URL을 넘겨 줌.
      // return this.getRequest<NewsFeed[]>();
      return this.getRequest<NewsFeed[]>(NEWS_URL);
    }
  }

  class NewsDetailApi {
    // CONTENT_URL은 혼자만 존재하는 url이 아니므로 id값만 받으면 됨.
    getData(id: string) : NewsDetail {
      return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id));
    }
  }

  interface NewsFeedApi extends Api {};
  interface NewsDetailApi extends Api {};

  // 의사코드 : 전체적으로 흐름만을 알기 위해서 문법에 상관없이 기재해 놓은 코드
  // 첫 번째 인자(NewsFeedApi, NewsDetailApi)로 받은 class한테 두 번째 인자(Api)로 받은 class의 내용을 applyApiMixins에 상속시켜 줌
  // 이건 마치 유사 extends -> 두번째 인자로 받는 class의 내용들을 첫 번째 인자로 옮겨 주는 역할. 굳이 왜 이 방법을?
  // 1. 기존 extends : 코드에 적시되어야 하는 상속 방법
  //    (상속의 관계를 바꾸고 싶으면 코드 자체를 바꿔야 된다는 뜻. 관계를 유연하게 가져갈 수 없다.)
  // 2. extends : 다중 상속을 지원하지 않음.
  //    상위 class를 n개를 받을 수 있는 구조로 만듦 - 배열
  applyApiMixins(NewsFeedApi, [Api]);
  applyApiMixins(NewsDetailApi, [Api]);

  // 뷰와 관련된 업데이트를 처리하는 코드
  function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
    for (let i = 0; i < feeds.length; i++) {
      feeds[i].read = false;
    }

    return feeds;
  }

  // 뷰와 관련된 업데이트를 처리하는 코드
  function updateView(html: string): void {
    if (container) {
      container.innerHTML = html;
    } else {
      console.error('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
    }
  }

  // 메인 뷰 처리하는 로직
  function newsFeed(): void {
    // newsFeed자체가 NEWS_URL을 직접 넘겨 주고 있기 때문에 바깥쪽에서 굳이 인자로 받을 필요가 없다
    // const api = new NewsFeedApi(NEWS_URL);
    const api = new NewsFeedApi();
    let newsFeed: NewsFeed[] = store.feeds;
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
      newsFeed = store.feeds = makeFeeds(api.getData());
    }

    for(let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
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

  // 메인 뷰 처리하는 로직
  function newsDetail(): void {
    const id = location.hash.substr(7);
    const api = new NewsDetailApi();
    const newsDetail: NewsDetail = api.getData(id);
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
          <h2>${newsDetail.title}</h2>
          <div class="text-gray-400 h-20">
            ${newsDetail.content}
          </div>

          {{__comments__}}

        </div>
      </div>
    `;

    for(let i=0; i < store.feeds.length; i++) {
      if (store.feeds[i].id === Number(id)) {
        store.feeds[i].read = true;
        break;
      }
    }

    updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
  }

  // 내용 뷰에서 코멘트를 나타내는 처리
  function makeComment(comments: NewsComment[]): string {
    const commentString = [];

    for(let i = 0; i < comments.length; i++) {
      const comment: NewsComment = comments[i];

      commentString.push(`
        <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>
      `);

      if (comment.comments.length > 0) {
        commentString.push(makeComment(comment.comments));
      }
    }

    return commentString.join('');
  }

  // 라우터 처리
  function router(): void {
    const routePath = location.hash;

    if (routePath === '') {
      newsFeed();
    } else if (routePath.indexOf('#/page/') >= 0) {
      store.currentPage = Number(routePath.substr(7));
      newsFeed();
    } else {
      newsDetail()
    }
  }

  window.addEventListener('hashchange', router);

  router();
