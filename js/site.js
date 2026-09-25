(function () {
  var searchInput = document.getElementById('site-search');
  var searchBox = document.getElementById('search-box');
  var searchToggle = document.getElementById('search-toggle');
  var bell = document.getElementById('bell');
  var bellMenu = document.getElementById('bell-menu');
  var bellDot = document.getElementById('bell-dot');

  if (searchToggle) {
    searchToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = searchBox.classList.toggle('open');
      searchToggle.setAttribute('aria-expanded', String(open));
      if (open) searchInput.focus();
    });
    searchBox.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () {
      if (!searchInput.value.trim()) {
        searchBox.classList.remove('open');
        searchToggle.setAttribute('aria-expanded', 'false');
      }
    });

    var hasProducts = document.querySelectorAll('.products').length > 0;

    var applyFilter = function (q) {
      q = q.trim().toLowerCase();
      document.querySelectorAll('.products').forEach(function (section) {
        var items = section.querySelectorAll('.product-card, .featured');
        var anyVisible = false;
        items.forEach(function (item) {
          var match = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
          item.style.display = match ? '' : 'none';
          if (match) anyVisible = true;
        });
        var note = section.querySelector('.no-results');
        if (!note) {
          note = document.createElement('p');
          note.className = 'no-results';
          note.textContent = 'No pieces match your search.';
          section.appendChild(note);
        }
        note.style.display = anyVisible ? 'none' : 'block';
      });
    };

    if (hasProducts) {
      searchInput.addEventListener('input', function () {
        applyFilter(this.value);
      });
      // Arriving with ?q= from another page: apply it and scroll to the results.
      var params = new URLSearchParams(window.location.search);
      var incoming = params.get('q');
      if (incoming) {
        searchInput.value = incoming;
        searchBox.classList.add('open');
        searchToggle.setAttribute('aria-expanded', 'true');
        applyFilter(incoming);
        // Keep the browser's scroll restoration from clobbering the jump to results.
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        var scrollToResults = function () {
          setTimeout(function () {
            var firstSection = document.querySelector('.products');
            if (firstSection) firstSection.scrollIntoView({ behavior: 'instant', block: 'start' });
          }, 60);
        };
        if (document.readyState === 'complete') scrollToResults();
        else window.addEventListener('load', scrollToResults);
      }
    } else {
      // No pieces on this page — the search box is a GET form that submits
      // to index.html?q=… on Enter; just block empty submits.
      searchBox.addEventListener('submit', function (e) {
        if (!searchInput.value.trim()) e.preventDefault();
      });
      searchInput.placeholder = 'Search pieces… (Enter)';
    }
  }

  if (bell) {
    // The bell lists every Instagram post from The Collection grid, newest first.
    // The dot only appears when the newest post is newer than what this visitor last saw.
    var posts = document.querySelectorAll('#products .product-grid .product-card');
    var latestUrl = posts.length ? posts[0].href : '';
    if (posts.length) {
      var seenUrl = null;
      try { seenUrl = localStorage.getItem('yutea-last-seen-post'); } catch (err) {}
      if (seenUrl !== latestUrl) bellDot.hidden = false;
      var label = document.createElement('p');
      label.className = 'menu-label';
      label.textContent = 'On Instagram';
      bellMenu.appendChild(label);
      var list = document.createElement('div');
      list.className = 'notif-list';
      posts.forEach(function (post, i) {
        var thumb = post.querySelector('img');
        var notif = document.createElement('a');
        notif.className = 'notif' + (i === 0 ? ' notif-new' : '');
        notif.href = post.href;
        notif.target = '_blank';
        notif.rel = 'noopener';
        var notifImg = document.createElement('img');
        notifImg.src = thumb ? thumb.src : '';
        notifImg.alt = '';
        var notifText = document.createElement('div');
        var notifTitle = document.createElement('h4');
        notifTitle.textContent = post.querySelector('h3').textContent;
        var notifDesc = document.createElement('p');
        notifDesc.textContent = post.querySelector('.product-info p').textContent;
        notifText.appendChild(notifTitle);
        notifText.appendChild(notifDesc);
        notif.appendChild(notifImg);
        notif.appendChild(notifText);
        list.appendChild(notif);
      });
      bellMenu.appendChild(list);
    } else {
      bellMenu.textContent = "You're all caught up ✨";
    }

    bell.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !bellMenu.hidden;
      bellMenu.hidden = open;
      bell.setAttribute('aria-expanded', String(!open));
      if (!open && latestUrl) {
        bellDot.hidden = true;
        try { localStorage.setItem('yutea-last-seen-post', latestUrl); } catch (err) {}
      }
    });
    document.addEventListener('click', function () {
      bellMenu.hidden = true;
      bell.setAttribute('aria-expanded', 'false');
    });
  }

  // ORB material camouflage stage
  var orbStage = document.getElementById('orb-stage');
  if (orbStage) {
    var orbBall = document.getElementById('orb-ball');
    var orbCaption = document.getElementById('orb-caption');
    var swatches = Array.prototype.slice.call(document.querySelectorAll('#orb-swatches .swatch'));

    swatches.forEach(function (btn) {
      // preload so the swap is instant
      var pre = new Image();
      pre.src = btn.getAttribute('data-ball');

      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-active')) return;
        swatches.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        orbStage.classList.add('swapping');
        setTimeout(function () {
          orbBall.src = btn.getAttribute('data-ball');
          orbBall.alt = btn.getAttribute('data-alt');
          orbStage.style.backgroundImage = "url('" + btn.getAttribute('data-tex') + "')";
          orbCaption.textContent = btn.getAttribute('data-caption');
          orbStage.classList.remove('swapping');
        }, 180);
      });
    });
  }
})();

// Contact form: "Contact Me" opens a modal; submissions are emailed via FormSubmit.
(function () {
  var links = document.querySelectorAll('a[href="#contact"]');
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;

  var dialog = document.createElement('dialog');
  dialog.className = 'contact-modal';
  dialog.setAttribute('aria-labelledby', 'contact-title');
  dialog.innerHTML =
    '<button type="button" class="contact-close" aria-label="Close">&times;</button>' +
    '<h2 id="contact-title">Contact Me</h2>' +
    '<p class="contact-sub">Leave your details and I\'ll get back to you.</p>' +
    '<form class="contact-form" novalidate>' +
      '<label><span>Name <em aria-hidden="true">*</em></span><input type="text" name="name" autocomplete="name" required /></label>' +
      '<label><span>Phone number <em aria-hidden="true">*</em></span><input type="tel" name="phone" autocomplete="tel" pattern="[0-9+()\\-.\\s]{7,}" required /></label>' +
      '<label><span>Email <em aria-hidden="true">*</em></span><input type="email" name="email" autocomplete="email" required /></label>' +
      '<label>Comments<textarea name="comments" rows="4"></textarea></label>' +
      '<input type="text" name="_honey" class="contact-honey" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
      '<p class="contact-status" role="status"></p>' +
      '<button type="submit" class="contact-submit">Send</button>' +
    '</form>';
  document.body.appendChild(dialog);

  var form = dialog.querySelector('form');
  var status = dialog.querySelector('.contact-status');
  var submit = dialog.querySelector('.contact-submit');

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.className = 'contact-status';
      dialog.showModal();
    });
  });
  dialog.querySelector('.contact-close').addEventListener('click', function () { dialog.close(); });
  // Click on the backdrop closes it.
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.classList.add('tried');
    if (!form.checkValidity()) {
      status.textContent = 'Please fill in your name, a valid phone number, and email.';
      status.className = 'contact-status error';
      var bad = form.querySelector(':invalid');
      if (bad) bad.focus();
      return;
    }
    var data = new FormData(form);
    data.append('_subject', 'New message from yutijetani.com');
    data.append('_template', 'table');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'contact-status';
    fetch('https://formsubmit.co/ajax/yutijetani.creates@gmail.com', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    })
      .then(function (res) { return res.json().then(function (j) { if (!res.ok || j.success === 'false') throw j; }); })
      .then(function () {
        form.reset();
        form.classList.remove('tried');
        status.textContent = 'Thank you! Your message has been sent.';
        status.className = 'contact-status success';
      })
      .catch(function () {
        status.textContent = 'Something went wrong. Please email yutijetani.creates@gmail.com directly.';
        status.className = 'contact-status error';
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = 'Send';
      });
  });
})();
