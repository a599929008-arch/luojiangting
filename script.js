/* ============================================================
   script.js —— 全站交互逻辑
   内容从 content.json 读取（方便在线后台编辑）
   ============================================================ */

(function () {
  "use strict";

  const PAGE_ORDER = ["past", "present", "future", "words", "birthday"];
  const page = document.body.getAttribute("data-page");
  let SITE = null;
  let PAGE_META = {};
  let bgmAudio = null;      // 背景音乐（initBGM 里赋值）
  let bgmUserPaused = false; // 用户是否主动用 ♪ 关掉了音乐
  let voicePlaying = 0;      // 正在播放的语音条数量

  function isUnlocked() {
    return localStorage.getItem("bday_unlocked") === "1";
  }

  function setupLock() {
    const lock = document.getElementById("lockScreen");
    if (!lock) return initPage();

    if (isUnlocked()) {
      lock.setAttribute("hidden", "");
      initPage();
      return;
    }

    // HTML 里密码门默认隐藏，未解锁时再显示（避免已解锁时闪现）
    lock.removeAttribute("hidden");

    const form = lock.querySelector(".lock-form");
    const input = lock.querySelector(".lock-input");
    const error = lock.querySelector(".lock-error");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const val = (input.value || "").trim();
      if (val === String(SITE.site.password)) {
        localStorage.setItem("bday_unlocked", "1");
        lock.setAttribute("hidden", "");
        initPage();
      } else {
        error.textContent = "再想想看。";
        error.classList.add("show");
        input.value = "";
        input.focus();
        setTimeout(() => error.classList.remove("show"), 1600);
      }
    });

    setTimeout(() => input && input.focus(), 400);
  }

  function observeReveal(root = document) {
    const items = root.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => io.observe(el));
  }

  function renderParagraphs(container, paragraphs) {
    container.innerHTML = "";
    (paragraphs || []).forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      p.classList.add("reveal");
      if (/^【.*】$/.test(text.trim())) p.classList.add("placeholder");
      container.appendChild(p);
    });
  }

  function buildNav(container, currentId) {
    const idx = PAGE_ORDER.indexOf(currentId);
    const prevId = idx > 0 ? PAGE_ORDER[idx - 1] : null;
    const nextId = idx >= 0 && idx < PAGE_ORDER.length - 1 ? PAGE_ORDER[idx + 1] : null;

    const prevWrap = container.querySelector(".nav-prev");
    const nextWrap = container.querySelector(".nav-next");

    if (prevId && PAGE_META[prevId]) {
      prevWrap.href = prevId + ".html";
      prevWrap.innerHTML = `<span class="nav-label">上一封</span><span>${PAGE_META[prevId].title}</span>`;
    } else {
      prevWrap.style.visibility = "hidden";
    }
    if (nextId && PAGE_META[nextId]) {
      nextWrap.href = nextId + ".html";
      nextWrap.innerHTML = `<span class="nav-label">下一封</span><span>${PAGE_META[nextId].title}</span>`;
    } else {
      nextWrap.style.visibility = "hidden";
    }
  }

  function formatDate(str) {
    if (!str) return "";
    return str.replace(/-/g, " · ");
  }

  function initIndex() {
    const cover = document.getElementById("cover");
    const dir = document.getElementById("directory");
    const openBtn = document.getElementById("openGift");
    const list = document.getElementById("entryList");
    const psLink = document.getElementById("psLink");

    document.getElementById("coverTo").textContent = "TO · " + SITE.site.toName;
    document.getElementById("coverDate").textContent = formatDate(SITE.site.date);
    document.getElementById("coverLine").textContent = SITE.index.tagline;
    openBtn.textContent = SITE.index.openButton;

    openBtn.addEventListener("click", () => {
      cover.style.opacity = "0";
      cover.style.transform = "scale(.96)";
      setTimeout(() => {
        cover.setAttribute("hidden", "");
        dir.removeAttribute("hidden");
        requestAnimationFrame(() => observeReveal(dir));
      }, 400);
    });

    list.innerHTML = "";
    SITE.index.entries.forEach((entry) => {
      const row = document.createElement("a");
      row.className = "entry-row reveal";
      row.href = entry.id + ".html";
      row.innerHTML = `
        <span class="entry-num">${entry.num}</span>
        <span class="entry-text">
          <span class="entry-title">${entry.title}</span>
          <span class="entry-sub">${entry.subtitle || ""}</span>
        </span>
        <span class="entry-arrow">→</span>`;
      list.appendChild(row);
    });

    if (psLink) psLink.addEventListener("click", () => (window.location.href = "secret.html"));

    observeReveal();
  }

  function initSimpleLetter(key) {
    const data = SITE[key];
    document.getElementById("letterNum").textContent = data.num;
    document.getElementById("letterTitle").textContent = data.title;
    document.getElementById("letterSub").textContent = data.subtitle || "";
    renderParagraphs(document.getElementById("letterBody"), data.paragraphs);
    buildNav(document.getElementById("navWrap"), key);
    observeReveal();
  }

  function initPast() {
    initSimpleLetter("past");
    document.getElementById("closing1").textContent = SITE.past.closingLine1;
    document.getElementById("closing2").textContent = SITE.past.closingLine2;
  }

  function initPresent() {
    initSimpleLetter("present");
    const chatWrap = document.getElementById("chatLog");
    const log = SITE.present.chatLog || [];
    if (!log.length) {
      chatWrap.setAttribute("hidden", "");
    } else {
      chatWrap.removeAttribute("hidden");
      chatWrap.innerHTML = "";
      log.forEach((item) => {
        const b = document.createElement("div");
        b.className = "chat-bubble " + (item.sender === "me" ? "me" : "her");
        b.textContent = item.text;
        chatWrap.appendChild(b);
      });
    }
  }

  function initFuture() {
    initSimpleLetter("future");
    const tl = document.getElementById("timeline");
    tl.innerHTML = "";
    (SITE.future.timeline || []).forEach((t) => {
      const item = document.createElement("div");
      item.className = "timeline-item";
      item.innerHTML = `<div class="timeline-year">${t.year}</div><div class="timeline-note">${t.note || ""}</div>`;
      tl.appendChild(item);
    });
  }

  function initWords() {
    initSimpleLetter("words");
    const bar = document.getElementById("progressBar");
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.width = Math.min(100, Math.max(0, scrolled * 100)) + "%";
    });
  }

  function initBirthday() {
    const data = SITE.birthday;
    document.getElementById("letterNum").textContent = data.num;
    document.getElementById("bdLead1").textContent = data.lead1;
    document.getElementById("bdLead2").textContent = data.lead2;
    document.getElementById("bdLead3").textContent = data.lead3;
    renderParagraphs(document.getElementById("letterBody"), data.paragraphs);
    document.getElementById("bdClosing").textContent = data.closing;
    buildNav(document.getElementById("navWrap"), "birthday");
    observeReveal();
  }

  /* ---------- 背景音乐（content.json 的 site.bgm 填了文件名才启用） ---------- */
  function initBGM() {
    const src = SITE.site && SITE.site.bgm;
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    bgmAudio = audio;

    let btn;

    function setBtn(playing) {
      if (btn) btn.classList.toggle("playing", playing);
    }

    function tryPlay() {
      audio.play().then(() => setBtn(true)).catch(() => setBtn(false));
    }

    // 右上角音符开关
    btn = document.createElement("button");
    btn.className = "bgm-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "音乐开关");
    btn.textContent = "♪";
    btn.addEventListener("click", () => {
      if (audio.paused) {
        bgmUserPaused = false;
        tryPlay();
      } else {
        bgmUserPaused = true;
        audio.pause();
      }
    });
    document.body.appendChild(btn);

    // 跨页续播：记住进度
    function saveTime() {
      if (!audio.paused) {
        try { localStorage.setItem("bgm_time", String(audio.currentTime)); } catch (e) {}
      }
    }
    setInterval(saveTime, 1000);
    window.addEventListener("beforeunload", saveTime);
    try {
      const t = parseFloat(localStorage.getItem("bgm_time"));
      if (!isNaN(t) && t > 0) audio.currentTime = t;
    } catch (e) {}

    // 尝试自动播放；被浏览器拦住就等第一次触摸页面时响起
    tryPlay();
    function firstTouch() {
      document.removeEventListener("pointerdown", firstTouch);
      if (audio.paused && !bgmUserPaused && voicePlaying === 0) tryPlay();
    }
    document.addEventListener("pointerdown", firstTouch);
  }

  function initSecret() {
    const s = SITE.secret;
    document.getElementById("secretIntro").textContent = s.intro;

    // 语音条：输入彩蛋①密码成功后才显示，一条一个卡片
    let voicesShown = false;
    function renderVoices() {
      if (voicesShown) return;
      voicesShown = true;
      const voices = s.voices || [];
      if (!voices.length) return;
      const inner = document.querySelector(".secret-inner");
      const firstEgg = inner.querySelector(".egg");
      voices.forEach((v) => {
        if (!v || !v.src) return;
        const card = document.createElement("div");
        card.className = "egg voice-egg reveal";
        const label = document.createElement("div");
        label.className = "voice-label";
        label.textContent = v.label || "· · ·";
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.preload = "none";
        audio.src = v.src;
        // 加载提示：网络慢时告诉人不是坏了
        audio.addEventListener("waiting", () => { label.textContent = (v.label || "· · ·") + "（加载中…）"; });
        audio.addEventListener("playing", () => { label.textContent = v.label || "· · ·"; });
        // 播放语音时暂停 BGM，暂停/播完后自动续播
        audio.addEventListener("play", () => {
          voicePlaying++;
          if (bgmAudio && !bgmAudio.paused) bgmAudio.pause();
        });
        audio.addEventListener("pause", () => {
          voicePlaying = Math.max(0, voicePlaying - 1);
          if (voicePlaying === 0 && bgmAudio && bgmAudio.paused && !bgmUserPaused) {
            bgmAudio.play().catch(() => {});
          }
        });
        card.appendChild(label);
        card.appendChild(audio);
        inner.insertBefore(card, firstEgg);
      });
      observeReveal();
    }

    // 彩蛋1：密码
    document.getElementById("egg1Hint").textContent = s.passwordHint;
    const form1 = document.getElementById("egg1Form");
    const reveal1 = document.getElementById("egg1Reveal");
    form1.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("egg1Input");
      if ((input.value || "").trim() === String(s.password)) {
        reveal1.textContent = s.passwordMessage;
        reveal1.classList.add("show");
        renderVoices();
      } else {
        input.value = "";
        input.placeholder = "再想想？";
      }
    });

    // 彩蛋2：戳一戳拼豆
    document.getElementById("egg2Caption").textContent = s.beadCaption;
    const bead = document.getElementById("egg2Bead");
    const beadReveal = document.getElementById("egg2Reveal");
    bead.addEventListener("click", () => {
      beadReveal.textContent = s.beadStory;
      beadReveal.classList.add("show");
    });

    // 彩蛋3：深夜时间
    document.getElementById("egg3Clock").textContent = s.midnightTime;
    const reveal3 = document.getElementById("egg3Reveal");
    document.getElementById("egg3Clock").addEventListener("click", () => {
      reveal3.textContent = s.midnightMessage;
      reveal3.classList.add("show");
    });

    // 彩蛋4：连续点击
    let count = 0;
    const dot = document.getElementById("egg4Dot");
    const reveal4 = document.getElementById("egg4Reveal");
    dot.addEventListener("click", () => {
      count++;
      if (count >= 5) {
        reveal4.textContent = s.hiddenMessage;
        reveal4.classList.add("show");
      }
    });

    // 彩蛋5：最终
    document.getElementById("egg5End").addEventListener("click", () => {
      const teaser = document.getElementById("egg5Teaser");
      teaser.textContent = s.finalTeaser + "　" + s.finalMessage;
      teaser.classList.add("show");
    });
    document.getElementById("egg5EndText").textContent = "· · ·";

    observeReveal();
  }

  function initPage() {
    switch (page) {
      case "index": initIndex(); break;
      case "past": initPast(); break;
      case "present": initPresent(); break;
      case "future": initFuture(); break;
      case "words": initWords(); break;
      case "birthday": initBirthday(); break;
      case "secret": initSecret(); break;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    fetch("content.json?_=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        SITE = data;
        PAGE_META = {};
        SITE.index.entries.forEach((e) => (PAGE_META[e.id] = e));
        initBGM();
        setupLock();
      })
      .catch(() => {
        document.body.innerHTML =
          '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#A9808F;text-align:center;padding:24px;">内容加载失败啦，如果是本地双击打开的，请用本地服务器方式预览（见说明文档）。</div>';
      });
  });
})();
