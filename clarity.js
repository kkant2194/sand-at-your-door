(function () {
  const config = window.SAND_APP_CONFIG || {};
  const projectId = String(config.clarityProjectId || "").trim();
  const localHosts = new Set(["", "localhost", "127.0.0.1", "::1"]);
  const isLocalhost = localHosts.has(window.location.hostname);

  window.trackBusinessEvent = function (eventName, tags = {}) {
    if (typeof window.clarity !== "function") return;
    window.clarity("event", eventName);
    Object.entries(tags).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        window.clarity("set", key, String(value));
      }
    });
  };

  if (!projectId || (isLocalhost && !config.enableAnalyticsOnLocalhost)) {
    return;
  }

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () {
      (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", projectId);
})();
