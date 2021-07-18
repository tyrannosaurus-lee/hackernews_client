const ajax = new XMLHttpRequest();

// ajax.open('GET', 'http://api.hnpwa.com/v0/news/1.json', false);
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
ajax.open('GET', NEWS_URL, false);
//동기적으로 처리하겠다.
ajax.send();    //ajax가 제공하는 send라고 하는 함수 호출

// console.log(ajax.response);

const newsFeed = JSON.parse(ajax.response);
// console.log(newsFeed);
// JSON.parse : json 데이터를 객체로 바꾸는 도구
// Response를 console.log로 찍은 것과 JSON.parse로 바꾼 객체를 찍은 것이 다르게 보임
// Preview 탭에서 봤던 것과 굉장히 유사하게 보임. 객체로 바뀌어서 그러함
// 자바스크립트에서 좀 더 손쉽게 데이터를 다룰 수 있게 됨.

const ul = document.createElement('ul');
for(let i=0; i<10; i++){
    // document.getElementById('root').innerHTML =
    // `<ul>
    //     <li>${newsFeed[0].title}</li>
    //     <li>${newsFeed[1].title}</li>
    //     <li>${newsFeed[2].title}</li>
    // </ul>`
    const li = document.createElement('li');
    li.innerHTML = newsFeed[i].title;
    ul.appendChild(li);
}

document.getElementById('root').appendChild(ul);


