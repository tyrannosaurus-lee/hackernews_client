  interface Store {
    currentPage: number;
    feeds: NewsFeed[];
  }

  interface News {
    // readonly : id 값을 다른 값으로 대체하지 못하게 하는 방법
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

  // class는 최초의 초기화되는 과정이 필요함.
  // 그 초기화 과정을 처리하는 함수가 바로 생성자
  class Api {
    // url을 내부에 저장
    url: string;
    ajax: XMLHttpRequest;
    // 먼저 url을 외부로부터 받음.
    constructor(url: string) {
      // class에 내부 요소로 접근하는(인스턴스 객체에 접근하는) 지시어 : this
      this.url = url;
      this.ajax = new XMLHttpRequest();
    }

    // protected : class의 속성과 메소드 등을 외부로 노출시키지 않는 지시어
    protected getRequest<AjaxResponse>(): AjaxResponse{
      this.ajax.open('GET', this.url, false);
      this.ajax.send();

      return JSON.parse(this.ajax.response);
    }
  }

  class NewsFeedApi extends Api {
    getData() : NewsFeed[] {
      return this.getRequest<NewsFeed[]>();
    }
  }

  class NewsDetailApi extends Api {
    getData() : NewsDetail[] {
      return this.getRequest<NewsDetail[]>();
    }
  }

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
    const api = new NewsFeedApi(NEWS_URL);
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
    const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
    const newsContent = api.getData();
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
