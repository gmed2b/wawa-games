import { useState, useRef, useEffect } from "react";

const ADMIN_PASSWORD = "Wael311013";
const BOT_NAME = "Aria AI";
const STORAGE_KEY = "aria_msgs_v2";
const POLL_MS = 1200;

const getId = () => Math.random().toString(36).slice(2, 9);
const getTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function useMessages() {
  const [messages, setMessages] = useState([]);

  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  };

  const save = (msgs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    window.dispatchEvent(new Event("aria_sync"));
  };

  useEffect(() => {
    setMessages(load());
    const sync = () => setMessages(load());
    window.addEventListener("aria_sync", sync);
    const t = setInterval(() => setMessages(load()), POLL_MS);
    return () => { window.removeEventListener("aria_sync", sync); clearInterval(t); };
  }, []);

  const add = (msg) => {
    const next = [...load(), msg];
    save(next);
    setMessages(next);
  };

  const clear = () => { save([]); setMessages([]); };

  return { messages, add, clear };
}

// ── TYPING DOTS ──
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
      }}>🤖</div>
      <div style={{
        background: "#1e1e2e", borderRadius: "14px 14px 14px 4px",
        padding: "10px 14px", display: "flex", gap: 5
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#6366f1",
            animation: "bounce 1.2s infinite", animationDelay: `${i*0.2}s`
          }}/>
        ))}
      </div>
    </div>
  );
}

// ── BUBBLE ──
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end", gap: 7, padding: "3px 12px",
      animation: "fadeUp .25s ease"
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isUser ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e1e2e",
        color: "#f1f5f9",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        padding: "10px 14px", fontSize: 14.5, lineHeight: 1.6,
        boxShadow: "0 2px 8px rgba(0,0,0,.3)"
      }}>
        {msg.text}
        <div style={{ fontSize: 10, opacity: .4, marginTop: 2, textAlign: isUser ? "left" : "right" }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  VUE UTILISATEUR
// ══════════════════════════════════════
function UserChat({ messages, add, onPremium }) {
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (waiting) {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant") setWaiting(false);
    }
  }, [messages]);

  const send = () => {
    if (!input.trim() || waiting) return;
    add({ id: getId(), role: "user", text: input.trim(), time: getTime() });
    setInput("");
    setWaiting(true);
  };

  return (
    <div style={{
      width: "100%", maxWidth: 430, margin: "0 auto",
      height: "100dvh", display: "flex", flexDirection: "column",
      background: "#0d0d14", fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9"
    }}>
      {/* Header */}
      <div style={{
        padding: "50px 16px 12px",
        background: "rgba(13,13,20,.97)",
        borderBottom: "1px solid #1e1e2e",
        display: "flex", alignItems: "center", gap: 11
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19
        }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{BOT_NAME}</div>
          <div style={{ fontSize: 11, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#22c55e", display: "inline-block", boxShadow: "0 0 4px #22c55e"
            }}/>
            En ligne · Répond instantanément
          </div>
        </div>

        {/* Bouton Premium discret */}
        <button onClick={onPremium} style={{
          background: "linear-gradient(135deg,#f59e0b,#d97706)",
          border: "none", borderRadius: 20,
          padding: "5px 13px", fontSize: 11.5, fontWeight: 700,
          color: "white", cursor: "pointer",
          boxShadow: "0 0 10px rgba(245,158,11,.3)",
          letterSpacing: .3
        }}>✦ Premium</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 12, paddingBottom: 6 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#475569" }}>
            <div style={{ fontSize: 42, marginBottom: 14 }}>✦</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
              Bonjour ! Je suis {BOT_NAME}
            </div>
            <div style={{ fontSize: 13 }}>Posez-moi n'importe quelle question.</div>
          </div>
        )}
        {messages.map(m => <Bubble key={m.id} msg={m} />)}
        {waiting && <TypingDots />}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 12px 30px",
        borderTop: "1px solid #1e1e2e",
        background: "rgba(13,13,20,.97)",
        display: "flex", gap: 9, alignItems: "flex-end"
      }}>
        <div style={{
          flex: 1, background: "#1e1e2e",
          border: "1px solid #2d2d3f", borderRadius: 22,
          padding: "10px 16px"
        }}>
          <textarea
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Écrivez votre message…"
            rows={1}
            disabled={waiting}
            style={{
              width: "100%", background: "transparent", border: "none",
              color: "#f1f5f9", fontSize: 15, resize: "none", outline: "none",
              fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100,
              opacity: waiting ? .5 : 1
            }}
          />
        </div>
        <button onClick={send} disabled={waiting} style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: input.trim() && !waiting
            ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e1e2e",
          border: "none", cursor: waiting ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, transition: "all .2s"
        }}>➤</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  LOGIN PREMIUM (secret)
// ══════════════════════════════════════
function PremiumLogin({ onSuccess, onBack }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  const tryLogin = () => {
    if (pwd === ADMIN_PASSWORD) { onSuccess(); }
    else { setError(true); setTimeout(() => setError(false), 1400); }
  };

  return (
    <div style={{
      width: "100%", maxWidth: 430, margin: "0 auto",
      height: "100dvh", background: "#0d0d14",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", padding: 24
    }}>
      <div style={{
        width: "100%", background: "#0f172a",
        border: "1px solid #1e3a5f", borderRadius: 20,
        padding: "36px 24px",
        animation: error ? "shake .4s" : "none"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%", margin: "0 auto 14px",
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26
          }}>✦</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#fbbf24" }}>Aria Premium</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 5 }}>
            Accès réservé aux membres premium
          </div>
        </div>

        <input
          type="password" value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tryLogin()}
          placeholder="Mot de passe premium…"
          style={{
            width: "100%", background: "#07101f",
            border: `1px solid ${error ? "#ef4444" : "#1e3a5f"}`,
            borderRadius: 12, padding: "14px 16px",
            color: "#f1f5f9", fontSize: 15, outline: "none",
            marginBottom: 10, fontFamily: "inherit"
          }}
        />
        {error && (
          <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 10, textAlign: "center" }}>
            Mot de passe incorrect
          </div>
        )}
        <button onClick={tryLogin} style={{
          width: "100%", padding: "14px",
          background: "linear-gradient(135deg,#f59e0b,#d97706)",
          border: "none", borderRadius: 12,
          color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer",
          marginBottom: 12
        }}>Accéder à Premium ✦</button>

        <button onClick={onBack} style={{
          width: "100%", padding: "12px",
          background: "transparent", border: "1px solid #1e3a5f",
          borderRadius: 12, color: "#475569", fontSize: 14,
          cursor: "pointer", fontFamily: "inherit"
        }}>← Retour</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  INTERFACE ADMIN (Wael répond)
// ══════════════════════════════════════
function AdminChat({ messages, add, clear, onExit }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const pendingCount = (() => {
    let n = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") n++;
      else break;
    }
    return n;
  })();

  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    add({ id: getId(), role: "assistant", text: input.trim(), time: getTime() });
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div style={{
      width: "100%", maxWidth: 430, margin: "0 auto",
      height: "100dvh", display: "flex", flexDirection: "column",
      background: "#07101f", fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9"
    }}>
      {/* Header admin */}
      <div style={{
        padding: "50px 16px 12px",
        background: "#0c1a2e",
        borderBottom: "1px solid #1e3a5f",
        display: "flex", alignItems: "center", gap: 11
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg,#f59e0b,#ef4444)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
        }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#fbbf24" }}>Mode Admin</div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            Vous répondez en tant que {BOT_NAME}
          </div>
        </div>
        {pendingCount > 0 && (
          <div style={{
            background: "#ef4444", color: "white",
            borderRadius: 20, padding: "3px 11px",
            fontSize: 12, fontWeight: 700, animation: "pulse 1.5s infinite"
          }}>{pendingCount} en attente</div>
        )}
        <button onClick={clear} style={{
          background: "transparent", border: "1px solid #334155",
          color: "#64748b", borderRadius: 8, padding: "5px 10px",
          fontSize: 12, cursor: "pointer"
        }}>🗑</button>
        <button onClick={onExit} style={{
          background: "#1e293b", border: "none",
          color: "#94a3b8", borderRadius: 8, padding: "5px 10px",
          fontSize: 12, cursor: "pointer"
        }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#1e3a5f" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>👁️</div>
            <div style={{ fontSize: 15, color: "#334155" }}>
              En attente d'un message…
            </div>
          </div>
        )}
        {messages.map(m => {
          const isAdmin = m.role === "assistant";
          return (
            <div key={m.id} style={{
              display: "flex",
              flexDirection: isAdmin ? "row-reverse" : "row",
              alignItems: "flex-end", gap: 7,
              padding: "3px 12px", animation: "fadeUp .2s ease"
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: isAdmin
                  ? "linear-gradient(135deg,#f59e0b,#ef4444)"
                  : "#0f2744",
                border: isAdmin ? "none" : "1px solid #1e3a5f",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isAdmin ? 13 : 14
              }}>
                {isAdmin ? "⚡" : "👤"}
              </div>
              <div style={{
                maxWidth: "75%",
                background: isAdmin ? "#1a1200" : "#0f2744",
                border: `1px solid ${isAdmin ? "#3d2a00" : "#1e3a5f"}`,
                borderRadius: isAdmin ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                padding: "9px 13px", fontSize: 14, lineHeight: 1.6,
                color: isAdmin ? "#fde68a" : "#bae6fd"
              }}>
                <div style={{ fontSize: 9.5, opacity: .6, marginBottom: 2, fontWeight: 600,
                  color: isAdmin ? "#f59e0b" : "#64748b" }}>
                  {isAdmin ? "Vous → affiché comme Aria AI" : "Utilisateur"}
                </div>
                {m.text}
                <div style={{ fontSize: 9.5, opacity: .35, marginTop: 2, textAlign: "right" }}>{m.time}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Message en attente */}
      {pendingCount > 0 && lastUserMsg && (
        <div style={{
          margin: "0 12px 8px",
          background: "#0f2744", border: "1px solid #1e3a5f",
          borderRadius: 10, padding: "8px 12px"
        }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>💬 À répondre :</div>
          <div style={{ color: "#bae6fd", fontSize: 13.5 }}>"{lastUserMsg.text}"</div>
        </div>
      )}

      {/* Input admin */}
      <div style={{
        padding: "10px 12px 30px",
        borderTop: "1px solid #1e3a5f",
        background: "#0c1a2e",
        display: "flex", gap: 9, alignItems: "flex-end"
      }}>
        <div style={{
          flex: 1, background: "#07101f",
          border: "1px solid #1e3a5f", borderRadius: 22,
          padding: "10px 16px"
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Votre réponse (vue comme Aria AI)…"
            rows={1}
            style={{
              width: "100%", background: "transparent", border: "none",
              color: "#fde68a", fontSize: 15, resize: "none", outline: "none",
              fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100
            }}
          />
        </div>
        <button onClick={send} style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: input.trim()
            ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "#1e293b",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, transition: "all .2s",
          boxShadow: input.trim() ? "0 0 14px rgba(245,158,11,.45)" : "none"
        }}>➤</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  ROOT
// ══════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("chat");
  const { messages, add, clear } = useMessages();

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-7px)} 75%{transform:translateX(7px)} }
        ::-webkit-scrollbar { display: none; }
        body { background: #0d0d14; }
      `}</style>

      {page === "chat" && (
        <UserChat
          messages={messages}
          add={add}
          onPremium={() => setPage("login")}
        />
      )}
      {page === "login" && (
        <PremiumLogin
          onSuccess={() => setPage("admin")}
          onBack={() => setPage("chat")}
        />
      )}
      {page === "admin" && (
        <AdminChat
          messages={messages}
          add={add}
          clear={clear}
          onExit={() => setPage("chat")}
        />
      )}
    </>
  );
}
