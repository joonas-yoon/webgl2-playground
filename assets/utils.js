const Utils = {
  GL: {
    createShader: function(gl, type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) return shader;

      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    },
    createProgram: function (gl, vertexShader, fragmentShader) {
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      var success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return program;
      }

      console.log(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    },
  },
  Browser: {
    resizeCanvasToDisplaySize: function(canvas) {
      // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
      const displayWidth  = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      // 캔버스와 크기가 다른지 확인합니다.
      const needResize = canvas.width  !== displayWidth ||
                        canvas.height !== displayHeight;

      if (needResize) {
        // 캔버스를 동일한 크기가 되도록 합니다.
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
      }

      return needResize;
    },
    loadImage: function(url, callback) {
      var image = new Image();
      image.src = url;
      image.onload = () => callback(image);
      return image;
    },
    loadImages: function(urls, callback) {
      var images = [];
      var imagesToLoad = urls.length;

      // 이미지 로딩이 완료될 때마다 호출됩니다.
      var onImageLoad = function() {
        --imagesToLoad;
        // 모든 이미지 로딩이 완료되면 콜백을 호출합니다.
        if (imagesToLoad === 0) {
          callback(images);
        }
      };

      for (var ii = 0; ii < imagesToLoad; ++ii) {
        var image = Utils.Browser.loadImage(urls[ii], onImageLoad);
        images.push(image);
      }

      return images;
    },
    requestAnimationFrame: function(callback, continued) {
      function loop(now) {
        callback(now);
        if (continued) {
          window.requestAnimationFrame(loop);
        }
      }
      window.requestAnimationFrame(loop);
    },
    UI: {
      getHUD: function() {
        let hud = document.getElementById('hud');
        if (!hud) {
          hud = document.createElement('div');
          hud.setAttribute('id', 'hud');
          hud.style.position = 'fixed';
          hud.style.right = '0px';
          hud.style.padding = '1em';
          document.body.appendChild(hud);
        }
        return hud;
      },
      addSlider: function(name, callback, min, max, step, value) {
        min = min || 0.0;
        max = max || 1.0;
        step = step || 0.001;
        value = value || 0;
        const id = 'slider-' + name;
        const hud = Utils.Browser.UI.getHUD();
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.innerText = name;
        label.style.marginRight = '0.5em';
        const labelV = document.createElement('label');
        labelV.innerText = value;
        labelV.style.width = '50px';
        labelV.style.display = 'inline-block';
        labelV.style.marginLeft = '0.5em';
        const input = document.createElement('input');
        label.setAttribute('id', id);
        input.setAttribute('type', 'range');
        input.setAttribute('min', min);
        input.setAttribute('max', max);
        input.setAttribute('step', step);
        input.setAttribute('value', value);
        input.addEventListener('input', (evt) => {
          evt.preventDefault();
          input.setAttribute('value', evt.target.value);
          labelV.innerText = evt.target.value;
          callback(Number(evt.target.value));
        });
        const div = document.createElement('div');
        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(labelV);
        hud.appendChild(div);
        return input;
      }
    }
  },
};
