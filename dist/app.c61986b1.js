// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"app.ts":[function(require,module,exports) {
"use strict";

var container = document.getElementById('root');
var ajax = new XMLHttpRequest();
var NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
var CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
var store = {
  currentPage: 1,
  feeds: []
};

function applyApiMixins(targetClass, baseClasses) {
  // 기능을 확장할 대상 class를 먼저 적어준다 - NewsFeedApi
  // 믹스인 관련 코드
  baseClasses.forEach(function (baseClasses) {
    Object.getOwnPropertyNames(baseClasses.prototype).forEach(function (name) {
      var descriptor = Object.getOwnPropertyDescriptor(baseClasses.prototype, name);

      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  });
}

var Api = function () {
  function Api() {} // url: string;
  // ajax: XMLHttpRequest;
  // constructor(url: string) {
  //   this.url = url;
  //   this.ajax = new XMLHttpRequest();
  // }
  // 생성자가 없어졌으니 Request를 받을 때 직접url을 받아줘야 함 (this 삭제)
  // protected getRequest<AjaxResponse>(): AjaxResponse{


  Api.prototype.getRequest = function (url) {
    // this의 ajax가 없으니 내부 변수로 만든다
    var ajax = new XMLHttpRequest(); // this.ajax.open('GET', this.url, false);

    ajax.open('GET', url, false); // this.ajax.send();

    ajax.send();
    return JSON.parse(ajax.response);
  };

  return Api;
}();

var NewsFeedApi = function () {
  function NewsFeedApi() {}

  NewsFeedApi.prototype.getData = function () {
    // getRequest의 명세가 바뀌었음
    // 입력 값으로 url을 받게 되어 있음. 그런데 url은 최종적으로 호출하는 쪽에서 줘야 함.
    // 그래서 getData 안에서 직접 NEWS_URL을 넘겨 줌.
    // return this.getRequest<NewsFeed[]>();
    return this.getRequest(NEWS_URL);
  };

  return NewsFeedApi;
}();

var NewsDetailApi = function () {
  function NewsDetailApi() {} // CONTENT_URL은 혼자만 존재하는 url이 아니므로 id값만 받으면 됨.


  NewsDetailApi.prototype.getData = function (id) {
    return this.getRequest(CONTENT_URL.replace('@id', id));
  };

  return NewsDetailApi;
}();

;
; // 의사코드 : 전체적으로 흐름만을 알기 위해서 문법에 상관없이 기재해 놓은 코드
// 첫 번째 인자(NewsFeedApi, NewsDetailApi)로 받은 class한테 두 번째 인자(Api)로 받은 class의 내용을 applyApiMixins에 상속시켜 줌
// 이건 마치 유사 extends -> 두번째 인자로 받는 class의 내용들을 첫 번째 인자로 옮겨 주는 역할. 굳이 왜 이 방법을?
// 1. 기존 extends : 코드에 적시되어야 하는 상속 방법
//    (상속의 관계를 바꾸고 싶으면 코드 자체를 바꿔야 된다는 뜻. 관계를 유연하게 가져갈 수 없다.)
// 2. extends : 다중 상속을 지원하지 않음.
//    상위 class를 n개를 받을 수 있는 구조로 만듦 - 배열

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]); // 뷰와 관련된 업데이트를 처리하는 코드

function makeFeeds(feeds) {
  for (var i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
} // 뷰와 관련된 업데이트를 처리하는 코드


function updateView(html) {
  if (container) {
    container.innerHTML = html;
  } else {
    console.error('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
  }
} // 메인 뷰 처리하는 로직


function newsFeed() {
  // newsFeed자체가 NEWS_URL을 직접 넘겨 주고 있기 때문에 바깥쪽에서 굳이 인자로 받을 필요가 없다
  // const api = new NewsFeedApi(NEWS_URL);
  var api = new NewsFeedApi();
  var newsFeed = store.feeds;
  var newsList = [];
  var template = "\n      <div class=\"bg-gray-600 min-h-screen\">\n        <div class=\"bg-white text-xl\">\n          <div class=\"mx-auto px-4\">\n            <div class=\"flex justify-between items-center py-6\">\n              <div class=\"flex justify-start\">\n                <h1 class=\"font-extrabold\">Hacker News</h1>\n              </div>\n              <div class=\"items-center justify-end\">\n                <a href=\"#/page/{{__prev_page__}}\" class=\"text-gray-500\">\n                  Previous\n                </a>\n                <a href=\"#/page/{{__next_page__}}\" class=\"text-gray-500 ml-4\">\n                  Next\n                </a>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"p-4 text-2xl text-gray-700\">\n          {{__news_feed__}}\n        </div>\n      </div>\n    ";

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(api.getData());
  }

  for (var i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push("\n        <div class=\"p-6 " + (newsFeed[i].read ? 'bg-red-500' : 'bg-white') + " mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100\">\n          <div class=\"flex\">\n            <div class=\"flex-auto\">\n              <a href=\"#/show/" + newsFeed[i].id + "\">" + newsFeed[i].title + "</a>\n            </div>\n            <div class=\"text-center text-sm\">\n              <div class=\"w-10 text-white bg-green-300 rounded-lg px-0 py-2\">" + newsFeed[i].comments_count + "</div>\n            </div>\n          </div>\n          <div class=\"flex mt-3\">\n            <div class=\"grid grid-cols-3 text-sm text-gray-500\">\n              <div><i class=\"fas fa-user mr-1\"></i>" + newsFeed[i].user + "</div>\n              <div><i class=\"fas fa-heart mr-1\"></i>" + newsFeed[i].points + "</div>\n              <div><i class=\"far fa-clock mr-1\"></i>" + newsFeed[i].time_ago + "</div>\n            </div>\n          </div>\n        </div>\n      ");
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
  template = template.replace('{{__next_page__}}', String(store.currentPage + 1));
  updateView(template);
} // 메인 뷰 처리하는 로직


function newsDetail() {
  var id = location.hash.substr(7);
  var api = new NewsDetailApi();
  var newsDetail = api.getData(id);
  var template = "\n      <div class=\"bg-gray-600 min-h-screen pb-8\">\n        <div class=\"bg-white text-xl\">\n          <div class=\"mx-auto px-4\">\n            <div class=\"flex justify-between items-center py-6\">\n              <div class=\"flex justify-start\">\n                <h1 class=\"font-extrabold\">Hacker News</h1>\n              </div>\n              <div class=\"items-center justify-end\">\n                <a href=\"#/page/" + store.currentPage + "\" class=\"text-gray-500\">\n                  <i class=\"fa fa-times\"></i>\n                </a>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"h-full border rounded-xl bg-white m-6 p-4 \">\n          <h2>" + newsDetail.title + "</h2>\n          <div class=\"text-gray-400 h-20\">\n            " + newsDetail.content + "\n          </div>\n\n          {{__comments__}}\n\n        </div>\n      </div>\n    ";

  for (var i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
} // 내용 뷰에서 코멘트를 나타내는 처리


function makeComment(comments) {
  var commentString = [];

  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i];
    commentString.push("\n        <div style=\"padding-left: " + comment.level * 40 + "px;\" class=\"mt-4\">\n          <div class=\"text-gray-400\">\n            <i class=\"fa fa-sort-up mr-2\"></i>\n            <strong>" + comment.user + "</strong> " + comment.time_ago + "\n          </div>\n          <p class=\"text-gray-700\">" + comment.content + "</p>\n        </div>\n      ");

    if (comment.comments.length > 0) {
      commentString.push(makeComment(comment.comments));
    }
  }

  return commentString.join('');
} // 라우터 처리


function router() {
  var routePath = location.hash;

  if (routePath === '') {
    newsFeed();
  } else if (routePath.indexOf('#/page/') >= 0) {
    store.currentPage = Number(routePath.substr(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener('hashchange', router);
router();
},{}],"../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54512" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","app.ts"], null)
//# sourceMappingURL=/app.c61986b1.js.map