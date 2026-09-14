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

    searchInput.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      var sections = document.querySelectorAll('.products');
      sections.forEach(function (section) {
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
    });
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
})();
