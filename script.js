/* davydwrites v3 - script.js */

/* ─── MOBILE MENU ─── */
(function () {
  var btn = document.getElementById('hamburger-btn');
  var menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
      }
    });
  }
})();

/* ─── SCROLL REVEALS ─── */
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(function (el) { observer.observe(el); });
})();

/* ─── HOMEPAGE TYPEWRITER ─── */
(function () {
  var target = document.getElementById('typewriter-target');
  if (!target) return;
  var text = target.getAttribute('data-text') || 'davydwrites';
  target.textContent = '';
  var cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  target.parentNode.insertBefore(cursor, target.nextSibling);
  var i = 0;
  function typeNext() {
    if (i < text.length) {
      target.textContent += text[i];
      i++;
      setTimeout(typeNext, 75 + Math.random() * 55);
    }
  }
  setTimeout(typeNext, 400);
})();

/* ─── FLOATING POETRY ─── */
(function () {
  if (window.innerWidth < 520) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var lines = [
    'a cut is an argument',
    'a held shot is a demand',
    'the science is not the point',
    'the loneliness is the point',
    'the writer proposes',
    'film makes time visible',
    'vague is the enemy',
    'I am always watching something',
    'loving a book and transcribing a book are not the same thing',
    'the stuff you leave out'
  ];

  var opacities = [0.035, 0.04, 0.05, 0.045, 0.055, 0.038, 0.048, 0.042, 0.065, 0.052];

  function spawnPoetry() {
    var line = lines[Math.floor(Math.random() * lines.length)];
    var opacity = opacities[Math.floor(Math.random() * opacities.length)];
    var el = document.createElement('div');
    el.className = 'poetry-float';
    el.textContent = line;
    var topPct = 10 + Math.random() * 80;
    var leftPct = 5 + Math.random() * 75;
    var duration = 22 + Math.random() * 18;
    el.style.top = topPct + '%';
    el.style.left = leftPct + '%';
    el.style.opacity = '0';
    document.body.appendChild(el);

    requestAnimationFrame(function () {
      el.style.transition = 'opacity 2s';
      el.style.opacity = opacity;
      var driftX = (Math.random() - 0.5) * 40;
      var driftY = -(20 + Math.random() * 30);
      setTimeout(function () {
        el.style.transition = 'transform ' + duration + 's linear, opacity 2s';
        el.style.transform = 'translate(' + driftX + 'px, ' + driftY + 'px)';
        setTimeout(function () {
          el.style.opacity = '0';
          setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
          }, 2000);
        }, (duration - 2) * 1000);
      }, 100);
    });

    var next = 9000 + Math.random() * 4000;
    setTimeout(spawnPoetry, next);
  }

  setTimeout(spawnPoetry, 2000);
})();

/* ─── POST TYPEWRITER REVEAL ─── */
(function () {
  var postBody = document.querySelector('.post-body');
  var skipBtn = document.getElementById('skip-btn');
  if (!postBody || !skipBtn) return;

  // Disable on mobile
  if (window.innerWidth < 768) {
    skipBtn.classList.add('hidden');
    return;
  }

  // Collect elements to animate
  var elements = Array.from(postBody.children).filter(function (el) {
    return el.tagName === 'P' || el.tagName === 'H2' || el.tagName === 'BLOCKQUOTE' || el.classList.contains('post-references') || el.tagName === 'FIGURE';
  });

  if (!elements.length) {
    skipBtn.classList.add('hidden');
    return;
  }

  // Store original HTML and hide all
  var originals = elements.map(function (el) {
    return el.innerHTML;
  });
  elements.forEach(function (el) {
    el.style.opacity = '0';
  });

  var currentIndex = 0;
  var cancelled = false;
  var typingInterval = null;

  function revealAll() {
    cancelled = true;
    if (typingInterval) clearInterval(typingInterval);
    elements.forEach(function (el, i) {
      el.innerHTML = originals[i];
      el.style.transition = 'opacity 0.3s';
      el.style.opacity = '1';
    });
    skipBtn.classList.add('hidden');
  }

  skipBtn.addEventListener('click', revealAll);

  function typeElement(index) {
    if (cancelled || index >= elements.length) {
      if (!cancelled) skipBtn.classList.add('hidden');
      return;
    }

    var el = elements[index];
    var original = originals[index];

    // References section and figures: just fade in
    if (el.classList.contains('post-references') || el.tagName === 'FIGURE') {
      el.innerHTML = original;
      el.style.transition = 'opacity 0.5s';
      el.style.opacity = '1';
      setTimeout(function () {
        typeElement(index + 1);
      }, 600);
      return;
    }

    // For typewriter: use a temp element to parse the HTML properly
    var temp = document.createElement('div');
    temp.innerHTML = original;

    // Flatten to array of {text, isEm} segments
    var segments = [];
    temp.childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        segments.push({ text: node.textContent, isEm: false });
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'EM') {
        segments.push({ text: node.textContent, isEm: true });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        segments.push({ text: node.textContent, isEm: false });
      }
    });

    // Build a flat array of characters with segment info
    var chars = [];
    segments.forEach(function (seg) {
      for (var c = 0; c < seg.text.length; c++) {
        chars.push({ ch: seg.text[c], isEm: seg.isEm });
      }
    });

    el.style.opacity = '1';
    el.innerHTML = '';

    var charIndex = 0;

    function buildHTML(upTo) {
      var html = '';
      var inEm = false;
      for (var i = 0; i < upTo; i++) {
        var item = chars[i];
        if (item.isEm && !inEm) {
          html += '<em>';
          inEm = true;
        } else if (!item.isEm && inEm) {
          html += '</em>';
          inEm = false;
        }
        // Escape HTML entities
        if (item.ch === '&') html += '&amp;';
        else if (item.ch === '<') html += '&lt;';
        else if (item.ch === '>') html += '&gt;';
        else html += item.ch;
      }
      if (inEm) html += '</em>';
      html += '<span class="typewriter-cursor"></span>';
      return html;
    }

    typingInterval = setInterval(function () {
      if (cancelled) {
        clearInterval(typingInterval);
        return;
      }
      charIndex++;
      el.innerHTML = buildHTML(charIndex);
      if (charIndex >= chars.length) {
        clearInterval(typingInterval);
        // Remove cursor and restore original HTML cleanly
        el.innerHTML = original;
        setTimeout(function () {
          typeElement(index + 1);
        }, 400);
      }
    }, 12);
  }

  // Start after a brief delay
  setTimeout(function () {
    typeElement(0);
  }, 300);
})();
