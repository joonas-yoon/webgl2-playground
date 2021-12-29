const URL = location.origin + location.pathname;
const BASE_URL = URL.substring(0, URL.lastIndexOf('/')) + '/';

async function setup() {
  const ul = document.getElementById("toc");
  const frame = document.getElementById("example");
  const code = document.getElementById('code');
  const codeWrapper = code.parentElement;
  const btnCode = document.getElementById('btn-code');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  const {list} = await fetch(BASE_URL + 'toc.json').then(res => res.json());
  const items = [];
  let currentIdx = 0;
  const param = getParam('v');

  for (const index in list) {
    const {title, href} = list[index];
    const li = document.createElement('li');
    li.setAttribute('class', 'item');
    li.setAttribute('href', href);
    li.setAttribute('title', title);
    li.addEventListener('click', (evt) => {
      evt.preventDefault();
      onSelectItem(li);
    });
    li.innerText = title;
    ul.appendChild(li);
    if (param == title) {
      currentIdx = index;
    }
    items.push(li);
  }

  // set-up Prism
  Prism.hooks.add('before-highlight', function (env) {
    env.code = env.element.innerText;
  });

  function setCodeText(text) {
    code.innerHTML = Prism.highlight(text, Prism.languages.html, 'html');
    codeWrapper.scroll(0, 0);
  }

  function activateItem(item) {
    for (const i of items){
      if (i === item) {
        i.classList.add('active');
      } else {
        i.classList.remove('active');
      }
    }
  }

  function onSelectItem(item) {
    if (item.className.indexOf('active') !== -1) {
      return;
    }
    const src = item.getAttribute('href');
    const url = BASE_URL + '/examples/' + src;
    frame.setAttribute('src', url);
    fetch(url).then(res => {
      res.text().then(setCodeText);
    });
    activateItem(item);
    // push history
    const title = item.getAttribute('title');
    var refreshURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
    refreshURL += '?v=' + encodeURI(title);
    window.history.pushState({ path: refreshURL }, '', refreshURL);
    // change title
    document.title = 'WebGL2 - ' + title;
  }

  // button to show code or result
  btnCode.addEventListener('click', (evt) => {
    evt.preventDefault();
    const showCode = btnCode.getAttribute('data-show-result') === "true";
    if (showCode) {
      codeWrapper.classList.add('show');
    } else {
      codeWrapper.classList.remove('show');
    }
    btnCode.setAttribute('data-show-result', showCode ? "false" : "true");
    btnCode.innerText = showCode ? "View result" : "View code";
  });

  btnPrev.addEventListener('click', (evt) => {
    evt.preventDefault();
    if (currentIdx - 1 >= 0) {
      currentIdx = currentIdx - 1;
      onSelectItem(items[currentIdx]);
      refreshArrowButton();
    }
  });

  btnNext.addEventListener('click', (evt) => {
    evt.preventDefault();
    if (currentIdx + 1 < items.length) {
      currentIdx = currentIdx + 1;
      onSelectItem(items[currentIdx]);
      refreshArrowButton();
    }
  });

  function refreshArrowButton() {
    const idx = currentIdx || 0;
    if (idx - 1 >= 0) {
      btnPrev.classList.add('show');
    } else {
      btnPrev.classList.remove('show');
    }
    if (idx + 1 < items.length) {
      btnNext.classList.add('show');
    } else {
      btnNext.classList.remove('show');
    }
  }

  function getParam(parameterName) {
    var result = null, tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
  }

  // emit first event as default
  onSelectItem(items[currentIdx]);
  refreshArrowButton();
}
