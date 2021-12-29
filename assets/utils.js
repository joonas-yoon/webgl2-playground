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
  MATH: {
    MAT3: {
      translation: function(tx, ty) {
        return [
          1, 0, 0,
          0, 1, 0,
          tx, ty, 1
        ];
      },
      rotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
          c,-s, 0,
          s, c, 0,
          0, 0, 1
        ];
      },
      scaling: function(sx, sy) {
        return [
          sx, 0, 0,
          0, sy, 0,
          0, 0, 1
        ];
      },
    },
    MAT4: {
      translation: function(tx, ty, tz) {
        return [
          1,  0,  0,  0,
          0,  1,  0,  0,
          0,  0,  1,  0,
          tx, ty, tz, 1,
        ];
      },
      rotationX: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
          1, 0, 0, 0,
          0, c, s, 0,
          0, -s, c, 0,
          0, 0, 0, 1,
        ];
      },
      rotationY: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
          c, 0, -s, 0,
          0, 1, 0, 0,
          s, 0, c, 0,
          0, 0, 0, 1,
        ];
      },
      rotationZ: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
          c, s, 0, 0,
          -s, c, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
        ];
      },
      scaling: function(sx, sy, sz) {
        return [
          sx, 0,  0,  0,
          0, sy,  0,  0,
          0,  0, sz,  0,
          0,  0,  0,  1,
        ];
      },
      translate: function(m, tx, ty, tz) {
        return Utils.MATH.MAT4.multiply(m, Utils.MATH.MAT4.translation(tx, ty, tz));
      },
      rotateX: function(m, angleInRadians) {
        return Utils.MATH.MAT4.multiply(m, Utils.MATH.MAT4.rotationX(angleInRadians));
      },
      rotateY: function(m, angleInRadians) {
        return Utils.MATH.MAT4.multiply(m, Utils.MATH.MAT4.rotationY(angleInRadians));
      },
      rotateZ: function(m, angleInRadians) {
        return Utils.MATH.MAT4.multiply(m, Utils.MATH.MAT4.rotationZ(angleInRadians));
      },
      scale: function(m, sx, sy, sz) {
        return Utils.MATH.MAT4.multiply(m, Utils.MATH.MAT4.scaling(sx, sy, sz));
      },
      multiply: function(a, b) {
        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];
        return [
          b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
          b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
          b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
          b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
          b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
          b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
          b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
          b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
          b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
          b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
          b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
          b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
          b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
          b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
          b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
          b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
      },
      projection: function(width, height, depth) {
        // 주의: 이 행렬은 Y축을 뒤집어 0이 위쪽이 되도록 합니다.
        return [
           2 / width, 0, 0, 0,
           0, -2 / height, 0, 0,
           0, 0, 2 / depth, 0,
          -1, 1, 0, 1,
        ];
      },
    }
  }
};
