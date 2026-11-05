// Mockups renderizados em CSS/SVG — mesmo layout dos apps reais, sem imagens externas.

export function Terrain() {
  // Contornos topográficos decorativos do hero.
  const ring = (d, o) => (
    <path d={d} fill="none" stroke="#8ABDF5" strokeOpacity={o} strokeWidth="1.15" strokeLinejoin="round" />
  );
  return (
    <svg className="lp-hero-terrain" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* pico direito */}
      {ring("M1230,90 C1330,120 1410,225 1430,335 C1450,450 1380,560 1270,600 C1160,640 1030,600 975,490 C920,385 950,235 1050,150 C1105,100 1165,70 1230,90 Z", 0.34)}
      {ring("M1235,165 C1305,190 1360,260 1375,340 C1390,430 1335,510 1245,540 C1150,570 1055,540 1015,455 C975,375 1000,260 1070,195 C1120,150 1185,140 1235,165 Z", 0.3)}
      {ring("M1240,240 C1290,260 1325,300 1335,350 C1345,410 1305,455 1235,472 C1165,490 1100,465 1070,405 C1040,350 1060,275 1105,235 C1145,200 1200,220 1240,240 Z", 0.26)}
      {ring("M1245,315 C1275,325 1300,345 1305,372 C1312,408 1285,428 1240,438 C1195,448 1150,432 1130,395 C1110,360 1125,315 1155,292 C1187,270 1225,300 1245,315 Z", 0.22)}
      {/* pico esquerdo baixo */}
      {ring("M-80,700 C40,640 210,650 330,720 C450,790 520,880 480,940", 0.24)}
      {ring("M-60,755 C60,705 205,712 305,772", 0.2)}
      {ring("M-50,810 C70,768 190,772 275,822", 0.16)}
      {/* planície central — hachura sutil */}
      {ring("M420,330 C640,270 880,300 1080,380", 0.16)}
      {ring("M430,392 C650,330 870,360 1075,432", 0.13)}
      {ring("M445,452 C660,395 865,420 1070,488", 0.1)}
      {/* pontos de elevação */}
      <g fill="#8ABDF5">
        <circle cx="1235" cy="335" r="2.6" opacity="0.8" />
        <circle cx="1240" cy="432" r="2.2" opacity="0.55" />
        <circle cx="300" cy="748" r="2.4" opacity="0.6" />
        <circle cx="760" cy="386" r="2.2" opacity="0.5" />
      </g>
      {/* cruzetas */}
      <g stroke="#8ABDF5" strokeOpacity="0.5" strokeWidth="1.4">
        <path d="M1235,327 v16 M1227,335 h16" />
        <path d="M300,740 v16 M292,748 h16" />
      </g>
      {/* linhas de varredura */}
      <g stroke="#8ABDF5" strokeOpacity="0.1" strokeWidth="1">
        <line x1="0" y1="120" x2="1600" y2="120" strokeDasharray="2 14" />
        <line x1="0" y1="620" x2="1600" y2="620" strokeDasharray="2 14" />
      </g>
    </svg>
  );
}

const Signal = ({ dark }) => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
    <rect x="0" y="7" width="3" height="5" rx="0.8" fill={dark ? "#f2f2f6" : "#1c1c1c"} />
    <rect x="4.5" y="4.5" width="3" height="7.5" rx="0.8" fill={dark ? "#f2f2f6" : "#1c1c1c"} />
    <rect x="9" y="2" width="3" height="10" rx="0.8" fill={dark ? "#f2f2f6" : "#1c1c1c"} />
    <rect x="13.5" y="0" width="3" height="12" rx="0.8" opacity="0.35" fill={dark ? "#f2f2f6" : "#1c1c1c"} />
  </svg>
);

export function StatusBar({ dark = false, time = "09:41" }) {
  return (
    <div className="lp-statusbar">
      <span>{time}</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Signal dark={dark} />
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
          <path d="M7.5 11.2 5.6 8.9a2.7 2.7 0 0 1 3.8 0L7.5 11.2Z" fill={dark ? "#f2f2f6" : "#1c1c1c"} opacity="0.9" />
          <path d="M3.2 6.8a6.1 6.1 0 0 1 8.6 0L10.3 8.3a3.9 3.9 0 0 0-5.6 0L3.2 6.8Z" fill={dark ? "#f2f2f6" : "#1c1c1c"} opacity="0.55" />
          <path d="M0.5 4.3a10 10 0 0 1 14 0L13 5.9a7.8 7.8 0 0 0-11 0L0.5 4.3Z" fill={dark ? "#f2f2f6" : "#1c1c1c"} opacity="0.3" />
        </svg>
        <svg width="21" height="12" viewBox="0 0 21 12" fill="none" aria-hidden="true">
          <rect x="0.5" y="1" width="16" height="10" rx="2.5" stroke={dark ? "#f2f2f6" : "#1c1c1c"} strokeOpacity="0.5" />
          <rect x="2" y="2.5" width="11" height="7" rx="1.2" fill={dark ? "#f2f2f6" : "#1c1c1c"} />
          <rect x="18" y="4" width="2" height="4" rx="0.8" fill={dark ? "#f2f2f6" : "#1c1c1c"} fillOpacity="0.5" />
        </svg>
      </span>
    </div>
  );
}

export function HomeScreen() {
  return (
    <>
      <StatusBar />
      <div className="lp-screen-scroll" style={{ background: "#f5f5f7" }}>
        <p className="lp-screen-title">Visão geral</p>
        <p className="lp-screen-sub">Olá, Ana. Sua rotina em campo, organizada.</p>
        <div className="lp-tiles">
          <div className="lp-tile dark-tile"><p>Realizadas hoje</p><strong>18</strong></div>
          <div className="lp-tile" style={{ background: "#E6F1FD" }}><p>Em preenchimento</p><strong>3</strong></div>
          <div className="lp-tile" style={{ background: "#EDE9FE" }}><p>Planos em andamento</p><strong>5</strong></div>
          <div className="lp-tile" style={{ background: "#FFF2DD" }}><p>Fechados / recusados</p><strong>2</strong></div>
        </div>
        <div className="lp-card-mini">
          <div className="lp-row-between"><span className="lp-mini-label">Visitas por região</span><span className="lp-mini-label" style={{ color: "#0066d6" }}>Ver tudo</span></div>
          <div className="lp-bars" aria-hidden="true">
            {[46, 74, 96, 58, 84].map((h, i) => (
              <div key={i} className="lp-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="lp-row-between" style={{ marginTop: 4 }}>
            {["Ouro B.", "Centro", "Jardins", "Z. Norte", "Sta. Cruz"].map((l) => (
              <span key={l} style={{ fontSize: "0.5rem", color: "#6b6b73" }}>{l}</span>
            ))}
          </div>
        </div>
        <div className="lp-card-mini" style={{ gap: 6, display: "flex", flexDirection: "column" }}>
          <div className="lp-row-between"><span className="lp-mini-label">Últimas visitas</span><span style={{ fontSize: "0.6rem", color: "#0066d6", fontWeight: 700 }}>12 de 74</span></div>
          {["Rua das Flores, 123", "Av. Central, 980", "Alameda Oeste, s/n"].map((v, i) => (
            <div key={i} className="lp-row-between" style={{ padding: "2px 0" }}>
              <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "#1c1c1c" }}>{v}</span>
              <span style={{ fontSize: "0.52rem", color: "#6b6b73" }}>{i === 0 ? "concluída" : i === 1 ? "em preenchimento" : "pendente"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-bottombar" />
    </>
  );
}

export function PlanningScreen() {
  const rows = [
    { nome: "Ouro Branco — Quadra 12", local: "Cascavel — PR · Ciclo 3 · Turma 1", tag: "Pendente", cls: "amber" },
    { nome: "Centro — Matriz", local: "Cascavel — PR · Ciclo 3 · Turma 1", tag: "Em andamento", cls: "blue" },
    { nome: "Jardins — Alameda", local: "Cascavel — PR · Ciclo 2 · Turma 2", tag: "Concluído", cls: "green" },
    { nome: "Zona Norte — Distritos", local: "Cascavel — PR · Ciclo 3 · Turma 2", tag: "Em andamento", cls: "blue" },
  ];
  return (
    <>
      <StatusBar />
      <div className="lp-screen-scroll" style={{ background: "#f5f5f7" }}>
        <p className="lp-screen-title">Planejamentos</p>
        <p className="lp-screen-sub">Escolha uma localidade para começar as visitas.</p>
        <div className="lp-card-mini" style={{ borderRadius: 12, padding: "8px 10px" }}>
          <span style={{ fontSize: "0.64rem", color: "#8a8a92" }}>Buscar localidade ou zona</span>
        </div>
        <div className="lp-list">
          {rows.map((r) => (
            <div key={r.nome} className="lp-plan-row">
              <strong>{r.nome}</strong>
              <span className="local">{r.local}</span>
              <span className="lp-row-between">
                <span className={`lp-tag ${r.cls}`}>{r.tag}</span>
                <span style={{ fontSize: "0.55rem", color: "#0066d6", fontWeight: 700 }}>Ver visitas ›</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-fab" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </div>
    </>
  );
}

export function RegistroScreen() {
  return (
    <>
      <StatusBar />
      <div className="lp-screen-scroll" style={{ background: "#f5f5f7" }}>
        <p className="lp-screen-title" style={{ textAlign: "center" }}>Visita</p>
        <div className="lp-step-track" aria-hidden="true">
          <i className="done" /><i /><i /><i /><i />
        </div>
        <span className="lp-mini-label" style={{ color: "#1c1c1c" }}>Etapa 1 de 5 — Imóvel</span>
        <p className="lp-screen-title" style={{ fontSize: "0.92rem", marginTop: 2 }}>Dados do imóvel</p>
        <div className="lp-field"><small>Endereço</small><span>Rua das Flores</span></div>
        <div className="lp-field"><small>Número do imóvel</small><span>123</span></div>
        <div className="lp-row-between" style={{ gap: 8 }}>
          <div className="lp-field" style={{ flex: 1 }}><small>Quarteirão</small><span>12</span></div>
          <div className="lp-field" style={{ flex: 1 }}><small>Face</small><span>2</span></div>
        </div>
        <div className="lp-field"><small>Hora de entrada</small><span>08:30</span></div>
        <div className="lp-screen-btn">Continuar para inspeção →</div>
      </div>
      <div className="lp-bottombar" />
    </>
  );
}

export function SettingsDarkScreen() {
  return (
    <>
      <StatusBar dark />
      <div className="lp-screen-scroll" style={{ background: "#121216" }}>
        <p className="lp-screen-title">Configurações</p>
        <div className="lp-card-mini">
          <div className="lp-settings-row accent">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M15.5 11.6A6.5 6.5 0 0 1 8.4 4.5a6.5 6.5 0 1 0 7.1 7.1Z" stroke="#f2f2f6" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#f2f2f6" }}>Modo escuro</span>
              <span style={{ display: "block", fontSize: "0.55rem", color: "#a6a6b0" }}>Tema escuro em todo o aplicativo</span>
            </span>
            <span className="lp-toggle" aria-hidden="true" />
          </div>
        </div>
        <div className="lp-card-mini">
          <p style={{ margin: 0, fontSize: "0.62rem", color: "#a6a6b0" }}>Versão instalada: <b style={{ color: "#f2f2f6" }}>1.3.1 (build 10)</b></p>
          <div className="lp-screen-btn" style={{ background: "#f2f2f6", color: "#1c1c1c", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5v8M4 6.5 7 9.5l3-3M2 12.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Procurar atualização
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "0.52rem", color: "#a6a6b0", lineHeight: 1.5 }}>A verificação automática continua ativa: o app procura atualizações ao abrir, no login e a cada minuto.</p>
        </div>
      </div>
      <div className="lp-bottombar" />
    </>
  );
}

const SideIcon = ({ children, active }) => (
  <span style={{ display: "flex", color: active ? "#0066d6" : "#6b6b73" }}>{children}</span>
);

export function WebDashboard() {
  const dot = { width: 10, height: 10, borderRadius: 99, background: "#e6e6ec", flex: "none" };
  return (
    <div className="lp-browser" role="img" aria-label="Painel web do Inteliagent com visão geral, métricas e últimas visitas">
      <div className="lp-browser-bar">
        <span className="lp-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="lp-address">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1" y="5" width="10" height="7" rx="1.5" stroke="#1668b0" strokeWidth="1.3" /><path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#1668b0" strokeWidth="1.3" /></svg>
          app.inteliagent.com.br/home
        </span>
      </div>
      <div className="lp-browser-body">
        <aside className="lp-sidebar">
          <div className="lp-side-brand">
            <img src="/brand/icon.svg" alt="" width="18" height="18" />
            Inteliagent
          </div>
          {[
            { t: "Visão geral", active: true, d: "M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM10 10h5v5h-5z" },
            { t: "Planejamento", d: "M3 5h12M3 8h12M3 11h7" },
            { t: "Agentes", d: "M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6a5 5 0 0 1 10 0" },
            { t: "Mensagens", d: "M3 4h12v8H8l-3 3v-3H3z" },
          ].map((item) => (
            <span key={item.t} className={`lp-side-item ${item.active ? "active" : ""}`}>
              <SideIcon active={item.active}>
                <svg width="13" height="13" viewBox="0 0 22 20" fill="none"><path d={item.d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </SideIcon>
              {item.t}
            </span>
          ))}
        </aside>
        <div className="lp-web-content">
          <p className="lp-web-title">Visão geral</p>
          <p className="lp-web-sub">Dados da sua sede · atualizado agora</p>
          <div className="lp-web-tiles">
            {[
              ["Realizadas hoje", "18"],
              ["Em andamento", "6"],
              ["Planos ativos", "9"],
              ["Pendências", "2"],
            ].map(([t, v]) => (
              <div key={t} className="lp-web-tile"><p>{t}</p><strong>{v}</strong></div>
            ))}
          </div>
          <div className="lp-web-chart">
            <div className="lp-row-between">
              <strong>Evolução das visitas</strong>
              <span className="lp-web-tiles-row"><span><i className="lp-legend-dot" />Realizadas</span><span><i className="lp-legend-dot dash" />Meta da sede</span></span>
            </div>
            <svg viewBox="0 0 320 96" width="100%" height="96" role="presentation" style={{ marginTop: 6 }}>
              <line x1="0" y1="80" x2="320" y2="80" stroke="#e0e0e6" strokeWidth="1" />
              <line x1="0" y1="48" x2="320" y2="48" stroke="#e9e9ee" strokeWidth="1" />
              <line x1="0" y1="16" x2="320" y2="16" stroke="#e9e9ee" strokeWidth="1" />
              <polyline points="0,74 46,68 92,70 138,52 184,46 230,30 276,22 320,14" fill="none" stroke="#0066d6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="0,60 46,52 92,44 138,40 184,34 230,30 276,24 320,20" fill="none" stroke="#6b6b73" strokeWidth="1.6" strokeDasharray="5 5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="lp-web-table">
            <span className="lp-mini-label">Últimas visitas</span>
            {[
              ["#28c840", "Rua das Flores, 123 — concluída", "há 5 min"],
              ["#febc2e", "Av. Central, 980 — em preenchimento", "há 21 min"],
              ["#8abdf5", "Alameda Oeste, s/n — sincronizada", "há 34 min"],
            ].map(([c, t, when], i) => (
              <div key={i} className="lp-web-row"><span className="lp-status-dot" style={{ background: c }} /><span style={{ flex: 1 }}>{t}</span><span style={{ color: "#8a8a92" }}>{when}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
