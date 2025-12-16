// static/thunder.js
// Thunder / Rain Canvas — drop this file into static/thunder.js

(function(){
  var canvas1 = document.getElementById('canvas1');
  var canvas2 = document.getElementById('canvas2');
  var canvas3 = document.getElementById('canvas3');
  if(!canvas1 || !canvas2 || !canvas3) return; // safety

  var ctx1 = canvas1.getContext('2d');
  var ctx2 = canvas2.getContext('2d');
  var ctx3 = canvas3.getContext('2d');

  var rainthroughnum = 400; // reduced for performance
  var speedRainTrough = 25;
  var RainTrough = [];

  var rainnum = 300; // reduced for performance
  var rain = [];

  var lightning = [];
  var lightTimeCurrent = 0;
  var lightTimeTotal = 0;

  var w = canvas1.width = canvas2.width = canvas3.width = window.innerWidth;
  var h = canvas1.height = canvas2.height = canvas3.height = window.innerHeight;

  window.addEventListener('resize', function() {
    w = canvas1.width = canvas2.width = canvas3.width = window.innerWidth;
    h = canvas1.height = canvas2.height = canvas3.height = window.innerHeight;
    // re-create drops so they fit new size
    createRainTrough();
    createRain();
  }, {passive:true});

  function random(min, max) { return Math.random() * (max - min) + min; }

  function clearcanvas1() { ctx1.clearRect(0, 0, w, h); }
  function clearcanvas2() { ctx2.clearRect(0, 0, w, h); }
  function clearCanvas3() {
    // fade out slightly to create trailing effect
    ctx3.globalCompositeOperation = 'destination-out';
    ctx3.fillStyle = 'rgba(0,0,0,' + (random(0.01, 0.03)) + ')';
    ctx3.fillRect(0, 0, w, h);
    ctx3.globalCompositeOperation = 'source-over';
  }

  function createRainTrough() {
    RainTrough.length = 0;
    for (var i = 0; i < rainthroughnum; i++) {
      RainTrough[i] = {
        x: random(0, w),
        y: random(0, h),
        length: Math.floor(random(50, 830)),
        opacity: Math.random() * 0.18,
        xs: random(-1.5, 1.5),
        ys: random(6, 20)
      };
    }
  }

  function createRain() {
    rain.length = 0;
    for (var i = 0; i < rainnum; i++) {
      rain[i] = {
        x: Math.random() * w,
        y: Math.random() * h,
        l: Math.random() * 1.5,
        xs: -4 + Math.random() * 4 + 2,
        ys: Math.random() * 10 + 10
      };
    }
  }

  function createLightning() {
    var x = random(100, w - 100);
    var y = random(0, h / 4);
    var createCount = Math.floor(random(1, 3));
    for (var i = 0; i < createCount; i++) {
      var single = {
        x: x + random(-30,30),
        y: y + random(-10,10),
        xRange: random(8, 30),
        yRange: random(10, 30),
        path: [{ x: x, y: y }],
        pathLimit: Math.floor(random(20, 45))
      };
      lightning.push(single);
    }
  }

  function drawRainTrough(i) {
    var rt = RainTrough[i];
    ctx1.beginPath();
    var grd = ctx1.createLinearGradient(0, rt.y, 0, rt.y + rt.length);
    grd.addColorStop(0, "rgba(255,255,255,0)");
    grd.addColorStop(1, "rgba(255,255,255," + rt.opacity + ")");
    ctx1.fillStyle = grd;
    ctx1.fillRect(rt.x, rt.y, 1, rt.length);
  }

  function drawRain(i) {
    var r = rain[i];
    ctx2.beginPath();
    ctx2.moveTo(r.x, r.y);
    ctx2.lineTo(r.x + r.l * r.xs, r.y + r.l * r.ys);
    ctx2.strokeStyle = 'rgba(174,194,224,0.45)';
    ctx2.lineWidth = 1;
    ctx2.lineCap = 'round';
    ctx2.stroke();
  }

  function drawLightning() {
    for (var i = lightning.length -1; i >=0; i--) {
      var light = lightning[i];

      // extend path
      var last = light.path[light.path.length - 1];
      light.path.push({
        x: last.x + (random(-light.xRange, light.xRange)),
        y: last.y + random(0, light.yRange)
      });

      if (light.path.length > light.pathLimit) {
        lightning.splice(i, 1);
        continue;
      }

      // draw
      ctx3.beginPath();
      ctx3.moveTo(light.x, light.y);
      for (var pc = 0; pc < light.path.length; pc++) {
        ctx3.lineTo(light.path[pc].x, light.path[pc].y);
      }
      ctx3.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx3.lineWidth = 2.5;
      ctx3.lineJoin = 'miter';
      ctx3.stroke();

      // occasional bright flash
      if (Math.floor(random(0, 40)) === 1) {
        ctx3.fillStyle = 'rgba(255,255,255,' + (random(0.01,0.04)) + ')';
        ctx3.fillRect(0, 0, w, h);
      }
    }
  }

  function animateRainTrough() {
    clearcanvas1();
    for (var i = 0; i < rainthroughnum; i++) {
      var rt = RainTrough[i];
      rt.y += speedRainTrough;
      if (rt.y - rt.length > h) {
        rt.y = -rt.length;
        rt.x = random(0, w);
      }
      drawRainTrough(i);
    }
  }

  function animateRain() {
    clearcanvas2();
    for (var i = 0; i < rainnum; i++) {
      var r = rain[i];
      r.x += r.xs;
      r.y += r.ys;
      if (r.x > w || r.y > h) {
        r.x = Math.random() * w;
        r.y = -20;
      }
      drawRain(i);
    }
  }

  function animateLightning() {
    clearCanvas3();
    lightTimeCurrent++;
    if (lightTimeCurrent >= lightTimeTotal) {
      // randomize next lightning timing
      lightTimeTotal = Math.floor(random(60, 200));
      lightTimeCurrent = 0;
      createLightning();
    }
    drawLightning();
  }

  function init() {
    createRainTrough();
    createRain();
    lightTimeTotal = Math.floor(random(30, 200));
  }
  init();

  function animloop() {
    animateRainTrough();
    animateRain();
    animateLightning();
    requestAnimationFrame(animloop);
  }
  animloop();

})();
