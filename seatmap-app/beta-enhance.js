(function () {
  const routes = {
    home: "/",
    reservation: "/reservation",
    menu: "/menu",
    admin: "/admin",
  };

  const languages = {
    bg: "Български",
    en: "English",
    ru: "Русский",
  };

  function openRoute(route) {
    const path = routes[route] || routes.home;
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveRoute(route);
  }

  function setActiveRoute(route) {
    document.querySelectorAll("[data-seatmap-route]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.seatmapRoute === route);
    });
  }

  function getRouteFromPath() {
    if (window.location.pathname === "/admin") return "admin";
    if (window.location.pathname === "/reservation") return "reservation";
    if (window.location.pathname === "/menu") return "menu";
    return "home";
  }

  function syncLanguage(nextLanguage) {
    window.localStorage.setItem("restaurant-lang", nextLanguage);
    const nativeButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent.trim().toLowerCase() === nextLanguage
    );

    if (nativeButton) {
      nativeButton.click();
      return;
    }

    window.location.reload();
  }

  function hideNativeLanguageControls() {
    document.querySelectorAll("div").forEach((element) => {
      const labels = Array.from(element.querySelectorAll(":scope > button")).map((button) =>
        button.textContent.trim()
      );
      if (["BG", "EN", "RU"].every((label) => labels.includes(label))) {
        element.classList.add("seatmap-native-language-hidden");
      }
    });
  }

  function buildCommandBar() {
    if (document.querySelector(".seatmap-command-bar")) return;

    const currentLanguage = window.localStorage.getItem("restaurant-lang") || "bg";
    const bar = document.createElement("div");
    bar.className = "seatmap-command-bar";
    bar.innerHTML = `
      <div class="seatmap-command-brand">
        <span class="seatmap-command-dot"></span>
        <div>
          <strong>SeatMap Beta</strong>
          <small>Restaurant OS live preview</small>
        </div>
      </div>
      <nav class="seatmap-command-nav" aria-label="SeatMap beta navigation">
        <button type="button" data-seatmap-route="home">Home</button>
        <button type="button" data-seatmap-route="reservation">Reservation map</button>
        <button type="button" data-seatmap-route="menu">Digital menu</button>
        <button type="button" data-seatmap-route="admin">Admin CRM</button>
      </nav>
      <label class="seatmap-language-select">
        <span>Language</span>
        <select aria-label="SeatMap language">
          ${Object.entries(languages)
            .map(
              ([code, label]) =>
                `<option value="${code}" ${code === currentLanguage ? "selected" : ""}>${label}</option>`
            )
            .join("")}
        </select>
      </label>
    `;

    bar.querySelectorAll("[data-seatmap-route]").forEach((button) => {
      button.addEventListener("click", () => openRoute(button.dataset.seatmapRoute));
    });

    bar.querySelector("select").addEventListener("change", (event) => {
      syncLanguage(event.target.value);
    });

    document.body.appendChild(bar);
    setActiveRoute(getRouteFromPath());
    hideNativeLanguageControls();

    const observer = new MutationObserver(hideNativeLanguageControls);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("popstate", () => setActiveRoute(getRouteFromPath()));
  window.addEventListener("message", (event) => {
    if (event.data?.type === "seatmap-open-route") {
      openRoute(event.data.route);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildCommandBar);
  } else {
    buildCommandBar();
  }
})();
