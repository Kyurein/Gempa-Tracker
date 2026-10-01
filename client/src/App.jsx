import { useCallback, useEffect, useState } from "react";
import { getEarthquakes, getMe, getNearby, getPlaces, getToken, setToken } from "./api.js";
import { formatWib, magColor } from "./quake.js";
import QuakeMap from "./components/QuakeMap.jsx";
import QuakeList from "./components/QuakeList.jsx";
import QuakeDetail from "./components/QuakeDetail.jsx";
import AuthForm from "./components/AuthForm.jsx";
import MyPlaces from "./components/MyPlaces.jsx";

const FILTERS = [
  { label: "All", value: 0 },
  { label: "M 4+", value: 4 },
  { label: "M 5+", value: 5 },
  { label: "M 6+", value: 6 },
];

export default function App() {
  const [quakes, setQuakes] = useState([]);
  const [minMag, setMinMag] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("loading");
  const [tab, setTab] = useState("all");

  const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [nearby, setNearby] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getEarthquakes({ minMag });
        if (!cancelled) { setQuakes(data); setStatus("ready"); }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    load();
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [minMag]);

  const loadMyData = useCallback(async () => {
    const [p, n] = await Promise.all([getPlaces(), getNearby(30)]);
    setPlaces(p);
    setNearby(n);
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    getMe()
      .then((u) => { setUser(u); return loadMyData(); })
      .catch(() => setToken(null));
  }, [loadMyData]);

  function handleAuth(token, u) {
    setToken(token);
    setUser(u);
    loadMyData();
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setPlaces([]);
    setNearby([]);
  }

  const latest = quakes[0];

  return (
    <div className="app">
      <header className="topbar">
        <h1>Gempa Tracker</h1>
        {latest && (
          <button className="latest" onClick={() => setSelected(latest)}>
            <span className="latest-mag" style={{ color: magColor(latest.magnitude) }}>
              {latest.magnitude.toFixed(1)}
            </span>
            <span>
              <span className="latest-label">Latest earthquake</span>
              <span className="latest-region">{latest.region}</span>
              <span className="latest-time">{formatWib(latest.occurred_at)}</span>
            </span>
          </button>
        )}
      </header>

      <main className="layout">
        <QuakeMap quakes={quakes} places={places} selected={selected} onSelect={setSelected} />

        <aside className="sidebar">
          {selected ? (
            <QuakeDetail quake={selected} onBack={() => setSelected(null)} />
          ) : (
            <>
              <div className="tabs" role="tablist">
                <button role="tab" aria-selected={tab === "all"} className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
                  All earthquakes
                </button>
                <button role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>
                  My places
                </button>
              </div>

              {tab === "all" && (
                <>
                  <div className="filters" role="group" aria-label="Minimum magnitude">
                    {FILTERS.map((f) => (
                      <button
                        key={f.value}
                        className={f.value === minMag ? "active" : ""}
                        aria-pressed={f.value === minMag}
                        onClick={() => setMinMag(f.value)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {status === "loading" && <p className="empty">Loading earthquakes…</p>}
                  {status === "error" && (
                    <p className="empty">
                      Couldn't reach the API. Check that the server is running and that
                      VITE_API_URL points to it.
                    </p>
                  )}
                  {status === "ready" && <QuakeList quakes={quakes} onSelect={setSelected} />}
                </>
              )}

              {tab === "mine" &&
                (user ? (
                  <MyPlaces
                    user={user}
                    places={places}
                    nearby={nearby}
                    onChange={loadMyData}
                    onSelect={setSelected}
                    onLogout={handleLogout}
                  />
                ) : (
                  <AuthForm onAuth={handleAuth} />
                ))}
            </>
          )}
        </aside>
      </main>

      <footer className="credit">
        Earthquake data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika).
      </footer>
    </div>
  );
}
