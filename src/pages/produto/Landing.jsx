import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";
import {
  Terrain,
  HomeScreen,
  PlanningScreen,
  RegistroScreen,
  SettingsDarkScreen,
  WebDashboard,
} from "./Mockups";

const CONTACT_EMAIL = "suporte@inteliagent.com.br";

function useReveal() {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    document.getElementById("root")?.removeAttribute("data-prerendered");
    const elements = root.querySelectorAll(".lp-reveal");
    if (typeof IntersectionObserver === "undefined") {
      elements.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    // Fallback: nunca deixa conteúdo invisível para quem não rolar a página.
    const timer = window.setTimeout(() => {
      elements.forEach((el) => el.classList.add("is-in"));
    }, 1500);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
  return rootRef;
}

function Phone({ caption, title, text, children, dark = false }) {
  return (
    <div className="lp-phone-wrap lp-reveal">
      <div className="lp-phone">
        <div className={`lp-phone-screen${dark ? " dark" : ""}`}>
          <div className="lp-notch" aria-hidden="true" />
          {children}
        </div>
      </div>
      <div className="lp-phone-caption">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

const pillars = [
  {
    title: "100% offline em campo",
    text: "O questionário completo funciona sem rede — salvo no aparelho e sincronizado depois.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10a12 12 0 0 1 16 0M7 13.5a8 8 0 0 1 10 0M9.8 17a4 4 0 0 1 4.4 0" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="19.4" r="1.4" fill="#1C1C1C" />
        <path d="M3 3l18 18" stroke="#B3261E" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Sincronização automática",
    text: "Visitas, inspeções, fotos e amostras sobem para a sede sem intervenção.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12a8 8 0 0 1 13.6-5.7M20 12a8 8 0 0 1-13.6 5.7" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17.8 2.5v4h-4M6.2 21.5v-4h4" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Boletim PNCD em PDF",
    text: "Frente e verso oficiais, gerados no aparelho com assinatura e totalizadores.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 3h7l4 4v14a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 21V4.5A1.5 1.5 0 0 1 7 3Z" stroke="#1C1C1C" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M14 3v4h4M9.5 12h5M9.5 15.5h5M9.5 8.5h2" stroke="#1C1C1C" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Planejamento por localidade",
    text: "Sedes, zonas e ciclos por equipe, com rotas no mapa, reordenação de visitas e acompanhamento por status em tempo real.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 4 3.5 6.5v13L9 17l6 2.5L20.5 17V4L15 6.5 9 4Z" stroke="#8ABDF5" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 4v13M15 6.5V19.5" stroke="#8ABDF5" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    title: "Visita completa sem papel",
    text: "Endereço por CEP, imóvel, inspeção de depósitos, coleta de amostras com fotos, tratamento e revisão — tudo em 5 etapas guiadas.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="6" y="3" width="12" height="18" rx="2.4" stroke="#8ABDF5" strokeWidth="1.7" />
        <path d="M9.5 8h5M9.5 12h5M9.5 16h3" stroke="#8ABDF5" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Mensagens com a sede",
    text: "Chat integrado com a equipe, notificações mesmo com o app fechado e registro por aparelho — sem depender de WhatsApp.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 12a8.5 8.5 0 0 1-12.3 7.6L4 21l1.6-4.5A8.5 8.5 0 1 1 21 12Z" stroke="#8ABDF5" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="9.5" cy="12" r="1.1" fill="#8ABDF5" />
        <circle cx="13.5" cy="12" r="1.1" fill="#8ABDF5" />
        <circle cx="17.5" cy="12" r="1.1" fill="#8ABDF5" />
      </svg>
    ),
  },
  {
    title: "Permissões por pessoa",
    text: "Administrador define quem cria planejamentos, quem edita e quem apenas executa — por agente, a qualquer momento.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.6" stroke="#8ABDF5" strokeWidth="1.7" />
        <path d="M5 20a7 7 0 0 1 14 0" stroke="#8ABDF5" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18 10.5l1.2 1.2L22 9" stroke="#8ABDF5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Modo escuro de verdade",
    text: "Tema claro e escuro alternáveis em todo o aplicativo, persistido no aparelho — conforto em campo e na sede.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.2" stroke="#8ABDF5" strokeWidth="1.7" />
        <path d="M12 4a8 8 0 0 1 0 16V4Z" fill="#8ABDF5" fillOpacity="0.45" />
      </svg>
    ),
  },
  {
    title: "Atualização sem esforço",
    text: "O app se atualiza sozinho quando há versão nova — obrigatória, persistente ou discreta conforme a mudança.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v10M8.5 9.5 12 13l3.5-3.5" stroke="#8ABDF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 17.5h15M6 21h12" stroke="#8ABDF5" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

const webBullets = [
  {
    title: "Métricas em tempo real",
    text: "Visitas realizadas, planos em andamento e pendências — sempre os dados locais do aparelho de quem sincroniza.",
    icon: (
      <svg key="metrics" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 15.5 7.5 10l4 3.5L17.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 4.5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Planejamento visual",
    text: "Fichas por localidade com zona, ciclo, visitas e etiquetas de status: verde concluído, âmbar pendente, azul em andamento.",
    icon: (
      <svg key="map" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7.5 3.5 2.8 5.4v11.2l4.7-1.9 5 2 4.7-1.9V4.6l-4.7 1.9-5-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M7.5 3.5v11.2M12.5 5.4v11.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Agentes e mensagens",
    text: "Quem pode fazer o quê, convites de acesso e chat com a equipe de campo — direto no navegador.",
    icon: (
      <svg key="chat" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M17.5 10a6.5 6.5 0 0 1-9.6 5.7L3 17l1.5-4.4A6.5 6.5 0 1 1 17.5 10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="7.6" cy="10" r="0.95" fill="currentColor" />
        <circle cx="10.4" cy="10" r="0.95" fill="currentColor" />
        <circle cx="13.2" cy="10" r="0.95" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Landing() {
  const rootRef = useReveal();
  const [form, setForm] = useState({ nome: "", org: "", email: "", mensagem: "" });
  const update = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  function sendContact(event) {
    event.preventDefault();
    const body = [
      `Nome: ${form.nome}`,
      form.org ? `Organização: ${form.org}` : null,
      `E-mail: ${form.email}`,
      "",
      form.mensagem,
    ]
      .filter(Boolean)
      .join("\n");
    const url =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent("Contato pelo site — " + form.nome)}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  return (
    <div className="lp-page" ref={rootRef}>
      {/* ---------- HERO ---------- */}
      <header className="lp-hero" id="top">
        <Terrain />
        <nav className="lp-nav" aria-label="Navegação principal">
          <a className="lp-brand" href="#top" aria-label="Inteliagent — início">
            <img src="/brand/icon.svg" alt="" />
            <span>
              <strong>Inteliagent</strong>
              <span>Vigilância em saúde</span>
            </span>
          </a>
          <div className="lp-nav-links">
            <a href="#aplicativo">O aplicativo</a>
            <a href="#plataforma">A plataforma</a>
            <a href="#contato">Fale com a gente</a>
          </div>
          <Link to="/home" className="lp-nav-cta">Entrar no app</Link>
        </nav>

        <div className="lp-hero-inner">
          <div>
            <p className="lp-eyebrow" style={{ color: "#8ABDF5" }}>
              Vigilância antivetorial · PNCD / FAD
            </p>
            <h1>
              Do planejamento<br />
              ao <em>boletim</em>,<br />
              na palma da mão.
            </h1>
            <p className="lead">
              O Inteliagent é o software para agentes de combate às endemias e
              equipes de vigilância em saúde. Organize a rotina completa:
              planejamento por localidade, visitas sem papel com coleta de amostras,
              tratamento, mensagens com a sede e o registro diário PNCD —
              offline em campo, sincronizado na hora certa.
            </p>
            <div className="lp-cta-row">
              <a className="lp-btn lp-btn-hero" href="#contato">
                Falar com a gente
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <a className="lp-btn lp-btn-ghost" href="#aplicativo">Ver o produto</a>
            </div>
            <div className="lp-trust" aria-label="Destaques">
              <span className="lp-chip"><svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" stroke="#8ABDF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Funciona offline</span>
              <span className="lp-chip"><svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" stroke="#8ABDF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>PNCD / FAD oficial</span>
              <span className="lp-chip"><svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" stroke="#8ABDF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Android + Web</span>
            </div>
          </div>

          <div className="lp-hero-stage" aria-hidden="true">
            <div className="lp-hero-glow" />
            <div className="lp-float-chip top">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="11" stroke="#8ABDF5" strokeWidth="1.6" /><path d="M9 13.2 12 16l5-6" stroke="#8ABDF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span><strong>PNCD-RS-4104808-2026.pdf</strong><span>Boletim pronto para enviar</span></span>
            </div>
            <div className="lp-float-chip bottom">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 13a9 9 0 0 1 15.3-6.3M22 13a9 9 0 0 1-15.3 6.3" stroke="#8ABDF5" strokeWidth="1.7" strokeLinecap="round" /><path d="M19.3 3.2v4h-4M6.7 22.8v-4h4" stroke="#8ABDF5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span><strong>12 visitas sincronizadas</strong><span>há 2 minutos · Turma 1</span></span>
            </div>
            <div className="lp-phone" style={{ transform: "rotate(4deg) translateY(-8px)", maxWidth: 300, zIndex: 4 }}>
              <div className="lp-phone-screen">
                <div className="lp-notch" />
                <HomeScreen />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Pilares ---------- */}
      <div className="lp-pillars">
        <div className="lp-container">
          {pillars.map((p) => (
            <div className="lp-pillar" key={p.title}>
              {p.icon}
              <span><strong>{p.title}</strong><span>{p.text}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Mobile ---------- */}
      <section className="lp-section" id="aplicativo" aria-labelledby="lp-app-title">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <p className="lp-eyebrow">O aplicativo Android</p>
            <h2 id="lp-app-title">Aplicativo offline para agentes de combate às endemias.</h2>
            <p>
              Formulário guiado em etapas, CEP com busca automática, depósito por
              depósito, fotos da amostra e o boletim pronto no fim do dia —
              mesmo sem nenhuma barra de sinal.
            </p>
          </div>
          <div className="lp-phones">
            <Phone title="Visão geral" text="Métricas do dia, evolução por região e últimas visitas — num relance.">
              <HomeScreen />
            </Phone>
            <Phone title="Planejamentos" text="Status com cores por localidade: quem entra no campo e o que já foi concluído.">
              <PlanningScreen />
            </Phone>
            <Phone title="Registro da visita" text="Cinco etapas guiadas: imóvel, inspeção, amostras, tratamento e revisão.">
              <RegistroScreen />
            </Phone>
            <Phone dark title="Modo escuro" text="Tema claro ou escuro em todo o app — e o usuário sempre no controle da atualização.">
              <SettingsDarkScreen />
            </Phone>
          </div>
        </div>
      </section>

      {/* ---------- Web ---------- */}
      <section className="lp-section" id="plataforma" style={{ background: "#fff", borderTop: "1px solid var(--lp-border)" }} aria-labelledby="lp-web-title">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <p className="lp-eyebrow">A plataforma web</p>
            <h2 id="lp-web-title">Plataforma web para a vigilância em saúde da sua cidade.</h2>
            <p>
              O que a equipe de campo faz no celular aparece na hora para
              gestores e administradores — métricas, rotas, agentes e mensagens,
              num navegador moderno.
            </p>
          </div>
          <div className="lp-web-grid">
            <div className="lp-reveal">
              <WebDashboard />
            </div>
            <div className="lp-feature-list lp-reveal">
              {webBullets.map((b) => (
                <div className="lp-feature-item" key={b.title}>
                  <span className="lp-icon-badge" aria-hidden="true">
                    {b.icon}
                  </span>
                  <span>
                    <strong>{b.title}</strong>
                    <span>{b.text}</span>
                  </span>
                </div>
              ))}
              <Link to="/home" className="lp-btn lp-btn-hero" style={{ alignSelf: "flex-start", color: "#0e1b28", background: "#8ABDF5", boxShadow: "none" }}>
                Entrar na plataforma
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Recursos ---------- */}
      <section className="lp-section lp-dark" style={{ background: "#131316" }} aria-labelledby="lp-why-title">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <p className="lp-eyebrow">Por que o Inteliagent</p>
            <h2 id="lp-why-title" style={{ color: "#f5f5f7" }}>Um produto inteiro, não um formulário bonito.</h2>
          </div>
          <div className="lp-features">
            {features.map((feature) => (
              <div className="lp-feature lp-reveal" key={feature.title}>
                {feature.icon}
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Contato ---------- */}
      <section className="lp-section" id="contato" aria-labelledby="lp-contact-title">
        <div className="lp-container">
          <div className="lp-contact-grid">
            <div className="lp-reveal">
              <p className="lp-eyebrow">Fale com a gente</p>
              <h2 id="lp-contact-title" className="lp-display" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)", letterSpacing: "-0.025em", lineHeight: 1.08, margin: "18px 0 16px" }}>
                Vamos digitalizar a vigilância da sua cidade?
              </h2>
              <p style={{ color: "var(--lp-muted)", lineHeight: 1.7, maxWidth: "30rem" }}>
                Quer conhecer o Inteliagent para a sua prefeitura ou secretaria
                de saúde? Conte para a gente sobre a operação da sua equipe —
                mostramos o produto funcionando de verdade, do planejamento ao
                boletim assinado.
              </p>
              <a className="lp-mail-btn" href={`mailto:${CONTACT_EMAIL}`}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <rect x="2" y="4.5" width="18" height="13" rx="2.5" stroke="#8ABDF5" strokeWidth="1.7" />
                  <path d="m3.5 7 7.5 6 7.5-6" stroke="#8ABDF5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {CONTACT_EMAIL}
              </a>
              <p className="lp-form-note" style={{ marginTop: 14 }}>Respondemos pelo e-mail em até 1 dia útil.</p>
            </div>
            <form className="lp-form lp-reveal" onSubmit={sendContact}>
              <div className="lp-field-group">
                <label htmlFor="lp-nome">Seu nome</label>
                <input id="lp-nome" className="lp-input" required value={form.nome} onChange={update("nome")} autoComplete="name" placeholder="Maria Silva" />
              </div>
              <div className="lp-field-group">
                <label htmlFor="lp-org">Prefeitura / organização <span style={{ textTransform: "none", fontWeight: 500, color: "#9a9aa2" }}>(opcional)</span></label>
                <input id="lp-org" className="lp-input" value={form.org} onChange={update("org")} autoComplete="organization" placeholder="Secretaria Municipal de Saúde de…" />
              </div>
              <div className="lp-field-group">
                <label htmlFor="lp-email">Seu e-mail</label>
                <input id="lp-email" className="lp-input" type="email" required value={form.email} onChange={update("email")} autoComplete="email" placeholder="voce@prefeitura.gov.br" />
              </div>
              <div className="lp-field-group">
                <label htmlFor="lp-msg">Como podemos ajudar?</label>
                <textarea id="lp-msg" className="lp-input" required value={form.mensagem} onChange={update("mensagem")} placeholder="Nossa sede precisa digitalizar o PNCD com 12 agentes de campo…" />
              </div>
              <button type="submit" className="lp-btn" style={{ background: "#1C1C1C", color: "#fff", justifyContent: "center" }}>
                Enviar mensagem
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2.5 9 16 2.5 9.5 16l-1.6-6.4L2.5 9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              </button>
              <p className="lp-form-note">Ao clicar em enviar, abriremos seu cliente de e-mail com a mensagem pronta para {CONTACT_EMAIL}.</p>
            </form>
          </div>
        </div>
      </section>

      {/* ---------- Rodapé ---------- */}
      <footer className="lp-footer">
        <div className="lp-container">
          <a className="lp-brand" href="#top" aria-label="Inteliagent — início">
            <img src="/brand/icon.svg" alt="" width="34" height="34" style={{ borderRadius: 10 }} />
            <span>
              <strong style={{ fontSize: "0.95rem" }}>Inteliagent</strong>
              <span>Gestão de campo</span>
            </span>
          </a>
          <nav aria-label="Rodapé">
            <a href="#aplicativo">O aplicativo</a>
            <a href="#plataforma">A plataforma</a>
            <a href="#contato">Fale com a gente</a>
            <Link to="/home">Entrar</Link>
          </nav>
          <span>© 2026 Inteliagent · Gestão de campo da vigilância em saúde</span>
        </div>
      </footer>
    </div>
  );
}
