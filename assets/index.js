const HOST = location.origin + location.pathname;
const BASE_URL = HOST.substring(0, HOST.lastIndexOf('/')) + '/';

async function setup() {
  const ul = document.getElementById("toc");
  const frame = document.getElementById("example");
  const code = document.getElementById('code');
  const codeWrapper = code.parentElement;
  const btnCode = document.getElementById('btn-code');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  const { root } = await fetch(BASE_URL + 'toc.json').then(res => res.json());
  const list = Object.keys(root).map(key => root[key]).reduce((p, c) => [...p].concat(c));
  const items = [];
  let currentIdx = 0;
  const param = getParam('v');

  // clear UI
  ul.innerHTML = '';

  // add to UI
  let index = 0;
  for (const key of Object.keys(root)) {
    const subject = document.createElement('li');
    subject.setAttribute('class', 'item subject');
    subject.innerText = key;
    ul.appendChild(subject);
    console.log(root[key]);
    for (const {title, href} of root[key]) {
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
      index += 1;
      items.push(li);
    }
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

  function onSelectItem(item, byClicked) {
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
    // change title
    const title = item.getAttribute('title');
    const docTitle = 'WebGL2 - ' + title;
    document.title = title;
    // push history
    if (byClicked) {
      var refreshURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
      refreshURL += '?v=' + encodeURI(title);
      window.history.pushState({ path: refreshURL, index: currentIdx }, docTitle, refreshURL);
    }
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
      onSelectItem(items[currentIdx], true);
      refreshArrowButton();
    }
  });

  btnNext.addEventListener('click', (evt) => {
    evt.preventDefault();
    if (currentIdx + 1 < items.length) {
      currentIdx = currentIdx + 1;
      onSelectItem(items[currentIdx], true);
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
    return parseParam(location.href, parameterName);
  }

  function parseParam(url, paramName) {
    try {
      return new URL(url).searchParams.get(paramName);
    } catch (err) {
      return '';
    }
  }

  function popHistory(evt) {
    const v = parseParam(evt.state.path, 'v');
    console.log(v);
    for (const i of items) {
      if (i.getAttribute('title') == v) {
        onSelectItem(i);
        refreshArrowButton();
        return;
      }
    }
    onSelectItem(items[0]);
    refreshArrowButton();
  }

  // emit first event as default
  onSelectItem(items[currentIdx]);
  refreshArrowButton();

  window.onpopstate = popHistory;
}

// when page loaded
window.onload = setup;
