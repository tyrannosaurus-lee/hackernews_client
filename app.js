const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'http://api.hnpwa.com/v0/item/@id.json'
//  item/id값.json에서 id값은 실제로 클릭했을 때 그 값을 넣어 주기 위해 마킹만 해놓음.

ajax.open('GET', NEWS_URL, false);
ajax.send();
// console.log(ajax.response);

const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement('ul');

// 해시가 바뀌었을 때 이벤트 발생.
// hashchange가 일어났다는 얘기는 현재 여기서 우리가 해시를 가지고 북마크로 사용하진 않고
// 그 기능을 사용하지 않고 있으니, 그걸 이용해서 어떤 링크, 어떤 타이틀이 클릭됐구나 생각
window.addEventListener('hashchange', function(){
    // CONTENT url을 이용해서 데이터를 불러옴
    const id = location.hash.substr(1);
    //location : 주소와 관련된 다양한 정보들을 제공해 줌.
    // substr(1)로 링크 맨 앞의 # 삭제
    console.log('해시가 변경됨');
    ajax.open('GET', CONTENT_URL.replace('@id', id), false);
    ajax.send();
    //  데이터가 들어오면 ajx.response에 JSON데이터로 들어갈 테니까 JSON.parse하면 됨

    const newsContent = JSON.parse(ajax.response);

    const title = document.createElement('h1');
    title.innerHTML = newsContent.title;
    content.appendChild(title);
    console.log(newsContent);
});

for(let i=0; i<10; i++){
    const div = document.createElement('div');// 임시로 쓰고 버릴 DOM(최종적으로 그 DOM을 쓰진 않을 것임)
    const li = document.createElement('li');
    const a = document.createElement('a');

    div.innerHTML =`
    <li>
        <a href="#${newsFeed[i].id}">
        ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
    </li>
    `;

    //  div태그 안에 추가된 li태그만 사용할 예정. div 태그가 갖고 있는 자식 요소가 li 태그
    //ul.appendChild(div.children[0]);
    ul.appendChild(div.firstElementChild);
}

container.appendChild(ul);
container.appendChild(content);

// DOM API를 이용해서 UI의 구조가 잘 드러나지 않는 문제점을
// 해결하는 가장 손쉬운 방법은 아이러니하게도 DOM API자체를 최대한 사용하지 않는 것.
// 그거슨 바로 문자열만을 가지고 UI를 만드는 방식