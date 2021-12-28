const URL = location.origin + location.pathname;
const BASE_URL = URL.substring(0, URL.lastIndexOf('/')) + '/';

async function setup() {
  const ul = document.getElementById("toc");
  const frame = document.getElementById("example");
  const code = document.getElementById('code');
  const codeWrapper = code.parentElement;
  const btnCode = document.getElementById('btn-code');
  const {list} = await fetch(BASE_URL + 'toc.json').then(res => res.json());
  const items = [];
  for (const {title, href} of list) {
    const li = document.createElement('li');
    li.setAttribute('class', 'item');
    li.setAttribute('href', href);
    li.addEventListener('click', (evt) => {
      evt.preventDefault();
      onSelectItem(li);
    });
    li.innerText = title;
    ul.appendChild(li);
    items.push(li);
  }

  // set-up Prism
  Prism.hooks.add('before-highlight', function (env) {
    env.code = env.element.innerText;
  });

  function setCodeText(text) {
    code.innerHTML = Prism.highlight(text, Prism.languages.html, 'html');
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
    const src = item.getAttribute('href');
    const url = BASE_URL + '/examples/' + src;
    frame.setAttribute('src', url);
    fetch(url).then(res => {
      res.text().then(setCodeText);
    });
    activateItem(item);
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

  // emit first event as default
  onSelectItem(items[0]);
}
