import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users, Calendar, DollarSign, Calculator, ClipboardList, BarChart2,
  ChevronLeft, ChevronRight, Plus, Trash2, Edit3, X, Check, Zap,
  TrendingUp, Award, Clock, MapPin, Phone, Mail, Activity, Menu,
  AlertCircle, CheckCircle, ChevronDown, Copy, Target, Star, Loader2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================
// SUPABASE
// ============================================================
const SUPABASE_URL = "https://bkchbdtjvoitjdgyweat.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrY2hiZHRqdm9pdGpkZ3l3ZWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTY3NTYsImV4cCI6MjA5NTE3Mjc1Nn0.0UEntF-J9J6ndrycGItjGws-oPdV_o5hm53coXiOxAo";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// UTILITÁRIOS
// ============================================================
const gerarId = () => Math.random().toString(36).substr(2, 9);

const calcularPace = (distancia, tempo) => {
  const partes = tempo.split(":");
  let segundos = 0;
  if (partes.length === 3) segundos = +partes[0] * 3600 + +partes[1] * 60 + +partes[2];
  else if (partes.length === 2) segundos = +partes[0] * 60 + +partes[1];
  if (!distancia || !segundos) return "–";
  const paceSegs = segundos / distancia;
  const min = Math.floor(paceSegs / 60);
  const sec = Math.round(paceSegs % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
};

const paceParaSegundos = (pace) => {
  if (!pace || pace === "–") return null;
  const p = pace.split(":");
  return +p[0] * 60 + (+p[1] || 0);
};

const tempoParaSegundos = (tempo) => {
  const t = tempo.split(":");
  if (t.length === 3) return +t[0] * 3600 + +t[1] * 60 + +t[2];
  if (t.length === 2) return +t[0] * 60 + +t[1];
  return 0;
};

const segundosParaTempo = (s) => {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = Math.round(s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

const nomeMes = (mes) => {
  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return meses[mes];
};

const iniciais = (nome) => nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================
const Avatar = ({ nome, foto, size = 40 }) => {
  if (foto) return <img src={foto} alt={nome} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#00A859", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {iniciais(nome)}
    </div>
  );
};

const Toast = ({ msg, tipo, onClose }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: tipo === "erro" ? "#c0392b" : "#00A859", color: "#fff", padding: "12px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease" }}>
    {tipo === "erro" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
    {msg}
    <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: 8 }}><X size={14} /></button>
  </div>
);

const Modal = ({ titulo, onClose, children, largura = 640 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, width: "100%", maxWidth: largura, maxHeight: "90vh", overflow: "auto", padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>{titulo}</h2>
        <button onClick={onClose} style={{ background: "#222", border: "none", color: "#fff", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

const Btn = ({ children, onClick, variante = "primario", icone, small, disabled, style: extraStyle }) => {
  const estilos = {
    primario: { background: "#00A859", color: "#fff", border: "none" },
    secundario: { background: "#1a1a1a", color: "#fff", border: "1px solid #333" },
    perigo: { background: "#c0392b", color: "#fff", border: "none" },
    fantasma: { background: "transparent", color: "#aaa", border: "1px solid #333" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...estilos[variante], padding: small ? "6px 12px" : "9px 18px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontSize: small ? 13 : 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1, transition: "opacity 0.2s", ...extraStyle }}>
      {icone}{children}
    </button>
  );
};

const Campo = ({ label, value, onChange, type = "text", placeholder, children, required }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", color: "#aaa", fontSize: 12, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}{required && " *"}</label>}
    {children || (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
    )}
  </div>
);

const CardResumo = ({ label, valor, icone, cor = "#00A859" }) => (
  <div style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ background: cor + "22", borderRadius: 10, padding: 10, color: cor }}>{icone}</div>
    <div>
      <div style={{ color: "#666", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginTop: 2 }}>{valor}</div>
    </div>
  </div>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
    <Loader2 size={32} color="#00A859" style={{ animation: "spin 1s linear infinite" }} />
  </div>
);

// ============================================================
// TABELA EDITÁVEL
// ============================================================
const TabelaEditavel = ({ colunas, linhas, onAdd, onRemove, onEdit }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {colunas.map(c => (
            <th key={c.key} style={{ color: "#666", fontWeight: 600, textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #222", whiteSpace: "nowrap" }}>{c.label}</th>
          ))}
          <th style={{ color: "#666", fontWeight: 600, textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #222" }}>
            <button onClick={onAdd} style={{ background: "#00A859", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, marginLeft: "auto" }}>
              <Plus size={12} /> Adicionar
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {linhas.length === 0 && <tr><td colSpan={colunas.length + 1} style={{ color: "#444", padding: "20px 12px", textAlign: "center" }}>Nenhum registro</td></tr>}
        {linhas.map((linha, i) => (
          <tr key={linha.id || i} style={{ borderBottom: "1px solid #1a1a1a" }}>
            {colunas.map(c => (
              <td key={c.key} style={{ padding: "8px 12px", color: "#ddd" }}>
                <input type={c.type || "text"} value={linha[c.key] || ""} onChange={(e) => onEdit(i, c.key, e.target.value)} style={{ background: "transparent", border: "none", color: "#ddd", fontSize: 13, width: "100%", outline: "none", minWidth: c.minWidth || 80 }} />
              </td>
            ))}
            <td style={{ padding: "8px 12px", textAlign: "right" }}>
              <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================================
// DASHBOARD DO ALUNO
// ============================================================
const DashboardAluno = ({ aluno, provasPassadas, provasFuturas, onUpdate, toast }) => {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ ...aluno });

  const totalProvas = provasPassadas.length;
  const distanciaTotal = provasPassadas.reduce((s, p) => s + (+p.distancia || 0), 0).toFixed(1);
  const paces = provasPassadas.filter(p => p.pace && p.pace !== "–").map(p => paceParaSegundos(p.pace)).filter(v => v !== null && !isNaN(v));
  const melhorPace = paces.length ? Math.min(...paces) : 0;
  const melhorPaceStr = melhorPace ? `${Math.floor(melhorPace / 60)}:${(melhorPace % 60).toString().padStart(2, "0")}` : "–";

  const dadosGrafico = provasPassadas
    .filter(p => p.pace && p.data && p.distancia)
    .sort((a, b) => a.data.localeCompare(b.data))
    .map(p => ({ data: p.data.substring(5), pace: paceParaSegundos(p.pace) / 60, nome: p.nome }));

  const colunasPassadas = [
    { key: "data", label: "Data", type: "date" },
    { key: "nome", label: "Prova", minWidth: 140 },
    { key: "distancia", label: "Dist. (km)", type: "number" },
    { key: "tempo", label: "Tempo", minWidth: 90 },
    { key: "pace", label: "Pace (min/km)" },
  ];

  const colunasFuturas = [
    { key: "data", label: "Data", type: "date" },
    { key: "nome", label: "Prova", minWidth: 140 },
    { key: "distancia", label: "Dist. (km)", type: "number" },
    { key: "objetivo_tempo", label: "Obj. Tempo" },
    { key: "objetivo_pace", label: "Obj. Pace" },
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <Avatar nome={aluno.nome} foto={aluno.foto} size={72} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>{aluno.nome}</h2>
              <span style={{ background: aluno.ativo ? "#00A85922" : "#66666622", color: aluno.ativo ? "#00A859" : "#888", fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{aluno.ativo ? "Ativo" : "Inativo"}</span>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", color: "#888", fontSize: 13 }}>
              {aluno.cidade && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} />{aluno.cidade}</span>}
              {aluno.telefone && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={13} />{aluno.telefone}</span>}
              {aluno.email && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Mail size={13} />{aluno.email}</span>}
              {aluno.data_inicio && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} />Desde {aluno.data_inicio}</span>}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {aluno.plano && <span style={{ background: "#00A85915", border: "1px solid #00A85933", color: "#00A859", fontSize: 12, padding: "3px 12px", borderRadius: 20, fontWeight: 700 }}>Plano: {aluno.plano}</span>}
              <span style={{ background: "#1a1a1a", border: "1px solid #333", color: "#aaa", fontSize: 12, padding: "3px 12px", borderRadius: 20 }}>R$ {aluno.mensalidade}/mês</span>
            </div>
          </div>
          <Btn variante="secundario" icone={<Edit3 size={14} />} onClick={() => setEditando(true)}>Editar</Btn>
        </div>
      </div>

      {/* Cards resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <CardResumo label="Total de Provas" valor={totalProvas} icone={<Award size={20} />} />
        <CardResumo label="Melhor Pace" valor={melhorPaceStr} icone={<Zap size={20} />} cor="#F39C12" />
        <CardResumo label="Distância Total" valor={`${distanciaTotal} km`} icone={<Activity size={20} />} cor="#0088CC" />
        <CardResumo label="Próximas Provas" valor={provasFuturas.length} icone={<Target size={20} />} cor="#9B59B6" />
      </div>

      {/* Gráfico */}
      {dadosGrafico.length > 1 && (
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Evolução do Pace</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="data" stroke="#555" tick={{ fill: "#666", fontSize: 11 }} />
              <YAxis stroke="#555" tick={{ fill: "#666", fontSize: 11 }} tickFormatter={v => `${Math.floor(v)}:${((v % 1) * 60).toFixed(0).padStart(2, "0")}`} reversed />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} labelStyle={{ color: "#aaa" }} itemStyle={{ color: "#00A859" }} formatter={(v) => [`${Math.floor(v)}:${Math.round((v % 1) * 60).toString().padStart(2, "0")} min/km`, "Pace"]} />
              <Line type="monotone" dataKey="pace" stroke="#00A859" strokeWidth={2} dot={{ fill: "#00A859", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Provas passadas */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>Provas Realizadas</h3>
        <TabelaEditavel
          colunas={colunasPassadas}
          linhas={provasPassadas}
          onAdd={() => onUpdate("addProvaPassada", { alunoId: aluno.id })}
          onRemove={(i) => onUpdate("removeProvaPassada", { alunoId: aluno.id, index: i })}
          onEdit={(i, key, val) => onUpdate("editProvaPassada", { alunoId: aluno.id, index: i, key, val })}
        />
      </div>

      {/* Provas futuras */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>Próximas Provas</h3>
        <TabelaEditavel
          colunas={colunasFuturas}
          linhas={provasFuturas}
          onAdd={() => onUpdate("addProvaFutura", { alunoId: aluno.id })}
          onRemove={(i) => onUpdate("removeProvaFutura", { alunoId: aluno.id, index: i })}
          onEdit={(i, key, val) => onUpdate("editProvaFutura", { alunoId: aluno.id, index: i, key, val })}
        />
      </div>

      {/* Modal edição */}
      {editando && (
        <Modal titulo="Editar Aluno" onClose={() => setEditando(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Campo label="Nome completo" value={form.nome} onChange={v => setForm({ ...form, nome: v })} required />
            <Campo label="Idade" value={form.idade || ""} onChange={v => setForm({ ...form, idade: v })} type="number" />
            <Campo label="Cidade" value={form.cidade || ""} onChange={v => setForm({ ...form, cidade: v })} />
            <Campo label="Telefone" value={form.telefone || ""} onChange={v => setForm({ ...form, telefone: v })} />
            <Campo label="Email" value={form.email || ""} onChange={v => setForm({ ...form, email: v })} type="email" />
            <Campo label="Plano" value={form.plano || ""} onChange={v => setForm({ ...form, plano: v })} />
            <Campo label="Mensalidade (R$)" value={form.mensalidade || ""} onChange={v => setForm({ ...form, mensalidade: v })} type="number" />
            <Campo label="Data de início" value={form.data_inicio || ""} onChange={v => setForm({ ...form, data_inicio: v })} type="date" />
            <div style={{ gridColumn: "1/-1" }}>
              <Campo label="URL da foto" value={form.foto || ""} onChange={v => setForm({ ...form, foto: v })} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ color: "#aaa", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Status</label>
              <button onClick={() => setForm({ ...form, ativo: !form.ativo })} style={{ background: form.ativo ? "#00A859" : "#333", border: "none", borderRadius: 20, padding: "6px 16px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{form.ativo ? "Ativo" : "Inativo"}</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <Btn variante="fantasma" onClick={() => setEditando(false)}>Cancelar</Btn>
            <Btn onClick={() => { onUpdate("editarAluno", form); setEditando(false); toast("Aluno atualizado!"); }} icone={<Check size={14} />}>Salvar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// ABA: CALENDÁRIO
// ============================================================
const AbaCalendario = ({ alunos, eventos, onUpdate, toast }) => {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [modalAberto, setModalAberto] = useState(null);
  const [eventoEdicao, setEventoEdicao] = useState(null);
  const [form, setForm] = useState({ alunoId: "", nome: "", distancia: "", tipo: "competição" });

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const dataStr = (dia) => `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const eventosDia = (dia) => eventos.filter(e => e.data === dataStr(dia));

  const salvarEvento = () => {
    if (!form.nome || !form.alunoId) return;
    if (eventoEdicao) {
      onUpdate("editarEvento", { id: eventoEdicao.id, ...form, data: modalAberto });
      toast("Evento atualizado!");
    } else {
      onUpdate("addEvento", { ...form, data: modalAberto, id: gerarId() });
      toast("Evento adicionado!");
    }
    setModalAberto(null); setEventoEdicao(null);
    setForm({ alunoId: alunos[0]?.id || "", nome: "", distancia: "", tipo: "competição" });
  };

  const proximas = [...eventos].filter(e => e.data >= hoje.toISOString().slice(0, 10)).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 10);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => { let m = mesAtual - 1, a = anoAtual; if (m < 0) { m = 11; a--; } setMesAtual(m); setAnoAtual(a); }} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: 8, color: "#fff", cursor: "pointer" }}><ChevronLeft size={16} /></button>
          <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: 0 }}>{nomeMes(mesAtual)} {anoAtual}</h2>
          <button onClick={() => { let m = mesAtual + 1, a = anoAtual; if (m > 11) { m = 0; a++; } setMesAtual(m); setAnoAtual(a); }} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: 8, color: "#fff", cursor: "pointer" }}><ChevronRight size={16} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => <div key={d} style={{ textAlign: "center", color: "#555", fontSize: 12, fontWeight: 700, padding: "4px 0" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array.from({ length: primeiroDia }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: diasNoMes }).map((_, i) => {
            const dia = i + 1;
            const evs = eventosDia(dia);
            const isHoje = dataStr(dia) === hoje.toISOString().slice(0, 10);
            return (
              <div key={dia} onClick={() => { setModalAberto(dataStr(dia)); setEventoEdicao(null); setForm({ alunoId: alunos[0]?.id || "", nome: "", distancia: "", tipo: "competição" }); }} style={{ minHeight: 70, background: isHoje ? "#00A85915" : "#1a1a1a", border: isHoje ? "1px solid #00A85966" : "1px solid #222", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}>
                <div style={{ color: isHoje ? "#00A859" : "#888", fontSize: 12, fontWeight: isHoje ? 800 : 500, marginBottom: 4 }}>{dia}</div>
                {evs.map(ev => {
                  const al = alunos.find(a => a.id === ev.aluno_id);
                  return (
                    <div key={ev.id} onClick={(e) => { e.stopPropagation(); setEventoEdicao(ev); setModalAberto(ev.data); setForm({ alunoId: ev.aluno_id, nome: ev.nome, distancia: ev.distancia, tipo: ev.tipo }); }} style={{ background: ev.tipo === "competição" ? "#00A85933" : "#0088CC33", color: ev.tipo === "competição" ? "#00A859" : "#60AADD", fontSize: 10, borderRadius: 4, padding: "2px 6px", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {al ? iniciais(al.nome) : ""} {ev.nome}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Próximos Eventos</h3>
        {proximas.length === 0 && <p style={{ color: "#555", fontSize: 13 }}>Nenhum evento futuro</p>}
        {proximas.map(ev => {
          const al = alunos.find(a => a.id === ev.aluno_id);
          return (
            <div key={ev.id} style={{ background: "#1a1a1a", borderRadius: 10, padding: "10px 12px", marginBottom: 8, borderLeft: `3px solid ${ev.tipo === "competição" ? "#00A859" : "#0088CC"}` }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{ev.nome}</div>
              <div style={{ color: "#666", fontSize: 11, marginTop: 3 }}>{ev.data} · {ev.distancia}km · {al?.nome?.split(" ")[0]}</div>
            </div>
          );
        })}
      </div>

      {modalAberto && (
        <Modal titulo={eventoEdicao ? "Editar Evento" : `Adicionar Evento — ${modalAberto}`} onClose={() => { setModalAberto(null); setEventoEdicao(null); }}>
          <Campo label="Aluno">
            <select value={form.alunoId} onChange={(e) => setForm({ ...form, alunoId: e.target.value })} style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none" }}>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </Campo>
          <Campo label="Nome da prova" value={form.nome} onChange={v => setForm({ ...form, nome: v })} />
          <Campo label="Distância (km)" value={form.distancia} onChange={v => setForm({ ...form, distancia: v })} type="number" />
          <Campo label="Tipo">
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none" }}>
              <option value="competição">Competição</option>
              <option value="treino">Treino</option>
            </select>
          </Campo>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 20 }}>
            {eventoEdicao && <Btn variante="perigo" icone={<Trash2 size={14} />} onClick={() => { onUpdate("removerEvento", { id: eventoEdicao.id }); setModalAberto(null); setEventoEdicao(null); toast("Evento removido!"); }}>Excluir</Btn>}
            <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
              <Btn variante="fantasma" onClick={() => { setModalAberto(null); setEventoEdicao(null); }}>Cancelar</Btn>
              <Btn onClick={salvarEvento}>Salvar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// ABA: FINANCEIRO
// ============================================================
const AbaFinanceiro = ({ alunos, pagamentos, onUpdate, toast }) => {
  const hoje = new Date();
  const [mesIdx, setMesIdx] = useState(hoje.getMonth());
  const [anoIdx, setAnoIdx] = useState(hoje.getFullYear());
  const [filtro, setFiltro] = useState("todos");
  const chave = `${anoIdx}-${String(mesIdx + 1).padStart(2, "0")}`;

  const getPg = (alunoId) => pagamentos.find(p => p.aluno_id === alunoId && p.chave === chave) || { status: "pendente", data: "", obs: "" };

  const alunosFiltrados = alunos.filter(a => {
    const s = getPg(a.id).status;
    if (filtro === "pagos") return s === "pago";
    if (filtro === "pendentes") return s === "pendente";
    return true;
  });

  const totalReceber = alunos.reduce((s, a) => s + (+a.mensalidade || 0), 0);
  const totalRecebido = alunos.reduce((s, a) => s + (getPg(a.id).status === "pago" ? +a.mensalidade || 0 : 0), 0);
  const totalPendente = totalReceber - totalRecebido;
  const adimplencia = totalReceber > 0 ? Math.round((totalRecebido / totalReceber) * 100) : 0;

  const togglePagamento = (alunoId) => {
    const pg = getPg(alunoId);
    const novoStatus = pg.status === "pago" ? "pendente" : "pago";
    onUpdate("setPagamento", { alunoId, chave, status: novoStatus, data: novoStatus === "pago" ? hoje.toISOString().slice(0, 10) : "", obs: pg.obs || "" });
    toast(novoStatus === "pago" ? "Pagamento registrado!" : "Marcado como pendente");
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <CardResumo label="Total a Receber" valor={`R$ ${totalReceber}`} icone={<DollarSign size={20} />} />
        <CardResumo label="Recebido" valor={`R$ ${totalRecebido}`} icone={<CheckCircle size={20} />} cor="#00A859" />
        <CardResumo label="Pendente" valor={`R$ ${totalPendente}`} icone={<AlertCircle size={20} />} cor="#E74C3C" />
        <CardResumo label="Adimplência" valor={`${adimplencia}%`} icone={<TrendingUp size={20} />} cor="#F39C12" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => { let m = mesIdx - 1, a = anoIdx; if (m < 0) { m = 11; a--; } setMesIdx(m); setAnoIdx(a); }} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: 7, color: "#fff", cursor: "pointer" }}><ChevronLeft size={15} /></button>
          <span style={{ color: "#fff", fontWeight: 700, minWidth: 140, textAlign: "center" }}>{nomeMes(mesIdx)} {anoIdx}</span>
          <button onClick={() => { let m = mesIdx + 1, a = anoIdx; if (m > 11) { m = 0; a++; } setMesIdx(m); setAnoIdx(a); }} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: 7, color: "#fff", cursor: "pointer" }}><ChevronRight size={15} /></button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["todos","pagos","pendentes"].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ background: filtro === f ? "#00A859" : "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>{["Aluno","Plano","Mensalidade","Status","Data Pgto","Observações","Ação"].map(h => <th key={h} style={{ color: "#555", fontWeight: 600, textAlign: "left", padding: "12px 16px", borderBottom: "1px solid #222" }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {alunosFiltrados.map(aluno => {
              const pg = getPg(aluno.id);
              return (
                <tr key={aluno.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar nome={aluno.nome} foto={aluno.foto} size={30} />
                      <span style={{ color: "#fff", fontWeight: 600 }}>{aluno.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#aaa" }}>{aluno.plano}</td>
                  <td style={{ padding: "12px 16px", color: "#aaa" }}>
                    <input type="number" value={aluno.mensalidade || ""} onChange={(e) => onUpdate("editMensalidade", { id: aluno.id, valor: e.target.value })} style={{ background: "transparent", border: "none", color: "#aaa", fontSize: 13, width: 70, outline: "none" }} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: pg.status === "pago" ? "#00A85922" : "#E74C3C22", color: pg.status === "pago" ? "#00A859" : "#E74C3C", padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 12 }}>{pg.status === "pago" ? "Pago" : "Pendente"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>{pg.data || "–"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <input value={pg.obs || ""} onChange={(e) => onUpdate("setObsPagamento", { alunoId: aluno.id, chave, obs: e.target.value })} placeholder="Observações..." style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, padding: "4px 8px", color: "#aaa", fontSize: 12, outline: "none", width: 140 }} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => togglePagamento(aluno.id)} style={{ background: pg.status === "pago" ? "#1a1a1a" : "#00A859", border: "1px solid #333", borderRadius: 7, padding: "5px 12px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{pg.status === "pago" ? "Desmarcar" : "Marcar Pago"}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// ABA: CALCULADORA
// ============================================================
const AbaCalculadora = () => {
  const [modo, setModo] = useState("paceTempo");
  const [distancia, setDistancia] = useState("");
  const [pace, setPace] = useState("");
  const [tempo, setTempo] = useState("");
  const [velocidade, setVelocidade] = useState("");
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    if (modo === "paceTempo") {
      if (!distancia || !pace) return;
      const [min, sec] = pace.split(":").map(Number);
      const paceSegs = min * 60 + (sec || 0);
      setResultado({ valor: segundosParaTempo(paceSegs * +distancia), extra: `${(3600 / paceSegs).toFixed(2)} km/h` });
    } else if (modo === "tempoPace") {
      if (!distancia || !tempo) return;
      const p = calcularPace(+distancia, tempo);
      const segs = tempoParaSegundos(tempo);
      setResultado({ valor: p + " min/km", extra: `${((+distancia / segs) * 3600).toFixed(2)} km/h` });
    } else {
      if (!velocidade) return;
      const paceSegs = 3600 / +velocidade;
      setResultado({ valor: `${Math.floor(paceSegs / 60)}:${Math.round(paceSegs % 60).toString().padStart(2, "0")} min/km`, extra: `${(+velocidade).toFixed(1)} km/h` });
    }
  };

  const tabela = useMemo(() => {
    if (!pace) return [];
    const [min, sec] = pace.split(":").map(Number);
    if (isNaN(min)) return [];
    const ps = min * 60 + (sec || 0);
    return [{ dist: "1 km", tempo: segundosParaTempo(ps) }, { dist: "5 km", tempo: segundosParaTempo(ps * 5) }, { dist: "10 km", tempo: segundosParaTempo(ps * 10) }, { dist: "21,1 km", tempo: segundosParaTempo(ps * 21.1) }, { dist: "42,2 km", tempo: segundosParaTempo(ps * 42.195) }];
  }, [pace]);

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[["paceTempo","Pace → Tempo"],["tempoPace","Tempo → Pace"],["velPace","Velocidade → Pace"]].map(([m, label]) => (
          <button key={m} onClick={() => { setModo(m); setResultado(null); }} style={{ background: modo === m ? "#00A859" : "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{label}</button>
        ))}
      </div>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 28 }}>
        {modo === "paceTempo" && (<><Campo label="Distância (km)" value={distancia} onChange={setDistancia} type="number" placeholder="Ex: 10" /><Campo label="Pace (min:seg/km)" value={pace} onChange={setPace} placeholder="Ex: 5:30" /></>)}
        {modo === "tempoPace" && (<><Campo label="Distância (km)" value={distancia} onChange={setDistancia} type="number" placeholder="Ex: 21.1" /><Campo label="Tempo total (hh:mm:ss)" value={tempo} onChange={setTempo} placeholder="Ex: 01:48:30" /></>)}
        {modo === "velPace" && <Campo label="Velocidade (km/h)" value={velocidade} onChange={setVelocidade} type="number" placeholder="Ex: 12" />}
        <Btn onClick={calcular} icone={<Calculator size={15} />} style={{ marginTop: 8, width: "100%" }}>Calcular</Btn>
        {resultado && (
          <div style={{ marginTop: 20, background: "#00A85915", border: "1px solid #00A85933", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ color: "#00A859", fontSize: 13, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Resultado</div>
            <div style={{ color: "#fff", fontSize: 32, fontWeight: 900 }}>{resultado.valor}</div>
            <div style={{ color: "#00A859", fontSize: 15, marginTop: 4 }}>{resultado.extra}</div>
          </div>
        )}
      </div>
      {tabela.length > 0 && (
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20, marginTop: 20 }}>
          <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Tabela de Referência — Pace {pace}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={{ color: "#555", textAlign: "left", padding: "8px 0", fontWeight: 600, fontSize: 12 }}>Distância</th><th style={{ color: "#555", textAlign: "right", padding: "8px 0", fontWeight: 600, fontSize: 12 }}>Tempo Estimado</th></tr></thead>
            <tbody>{tabela.map(r => <tr key={r.dist} style={{ borderTop: "1px solid #1a1a1a" }}><td style={{ color: "#aaa", padding: "10px 0", fontSize: 14 }}>{r.dist}</td><td style={{ color: "#fff", padding: "10px 0", fontSize: 14, fontWeight: 700, textAlign: "right" }}>{r.tempo}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================================================
// ABA: PLANILHA DE TREINOS
// ============================================================
const tiposTreino = { Leve: { bg: "#00A85933", color: "#00A859" }, Moderado: { bg: "#F39C1233", color: "#F39C12" }, Forte: { bg: "#E74C3C33", color: "#E74C3C" }, Descanso: { bg: "#33333344", color: "#888" }, Prova: { bg: "#9B59B633", color: "#9B59B6" }, "": { bg: "transparent", color: "#555" } };

const AbaPlanilha = ({ alunos, treinos, onUpdate, toast }) => {
  const [alunoId, setAlunoId] = useState(alunos[0]?.id || "");
  const [semana, setSemana] = useState(0);
  const hoje = new Date();
  const diasSemana = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const offsetInicio = (primeiroDia.getDay() + 6) % 7;
  const totalDias = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const totalSemanas = Math.ceil((totalDias + offsetInicio) / 7);
  const semanas = Array.from({ length: totalSemanas }, (_, si) => Array.from({ length: 7 }, (_, di) => { const d = si * 7 + di - offsetInicio + 1; return (d < 1 || d > totalDias) ? null : d; }));
  const chave = (dia) => `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const getTreino = (dia) => treinos.find(t => t.aluno_id === alunoId && t.chave === chave(dia)) || { tipo: "", distancia: "", obs: "" };

  const exportar = () => {
    let txt = `Planilha — ${alunos.find(a => a.id === alunoId)?.nome}\n\n`;
    semanas.forEach((sem, si) => {
      txt += `Semana ${si + 1}:\n`;
      sem.forEach((dia, di) => { if (!dia) return; const t = getTreino(dia); txt += `  ${diasSemana[di]} ${dia}: ${t.tipo || "–"} ${t.distancia ? t.distancia + "km" : ""} ${t.obs ? "/ " + t.obs : ""}\n`; });
      txt += "\n";
    });
    navigator.clipboard.writeText(txt);
    toast("Planilha copiada!");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "9px 16px", color: "#fff", fontSize: 14, outline: "none" }}>
          {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>{Object.entries(tiposTreino).filter(([k]) => k).map(([k, v]) => <span key={k} style={{ background: v.bg, color: v.color, fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>{k}</span>)}</div>
          <Btn variante="secundario" icone={<Copy size={14} />} onClick={exportar} small>Copiar</Btn>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setSemana(s => Math.max(0, s - 1))} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 7, padding: 6, color: "#fff", cursor: "pointer" }}><ChevronLeft size={15} /></button>
        <span style={{ color: "#aaa", fontWeight: 700 }}>Semana {semana + 1}</span>
        <button onClick={() => setSemana(s => Math.min(totalSemanas - 1, s + 1))} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 7, padding: 6, color: "#fff", cursor: "pointer" }}><ChevronRight size={15} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {diasSemana.map(d => <div key={d} style={{ textAlign: "center", color: "#555", fontSize: 12, fontWeight: 700, paddingBottom: 6 }}>{d}</div>)}
        {(semanas[semana] || []).map((dia, di) => {
          if (!dia) return <div key={di} style={{ background: "#0a0a0a", borderRadius: 10, minHeight: 130, opacity: 0.3 }} />;
          const t = getTreino(dia);
          const tc = tiposTreino[t.tipo] || tiposTreino[""];
          return (
            <div key={dia} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 10, minHeight: 130 }}>
              <div style={{ color: "#666", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{dia}</div>
              <select value={t.tipo || ""} onChange={(e) => onUpdate("editarTreino", { alunoId, chave: chave(dia), campo: "tipo", valor: e.target.value, treino: t })} style={{ width: "100%", background: tc.bg, border: "none", borderRadius: 5, padding: "4px 6px", color: tc.color, fontSize: 11, fontWeight: 700, outline: "none", marginBottom: 6 }}>
                <option value="">–</option>
                {Object.keys(tiposTreino).filter(k => k).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <input type="number" value={t.distancia || ""} onChange={(e) => onUpdate("editarTreino", { alunoId, chave: chave(dia), campo: "distancia", valor: e.target.value, treino: t })} placeholder="km" style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 5, padding: "4px 6px", color: "#fff", fontSize: 11, outline: "none", marginBottom: 4, boxSizing: "border-box" }} />
              <input value={t.obs || ""} onChange={(e) => onUpdate("editarTreino", { alunoId, chave: chave(dia), campo: "obs", valor: e.target.value, treino: t })} placeholder="obs..." style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 5, padding: "4px 6px", color: "#aaa", fontSize: 10, outline: "none", boxSizing: "border-box" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// ABA: RELATÓRIOS
// ============================================================
const AbaRelatorios = ({ alunos, provasPassadas, pagamentos }) => {
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const totalAtivos = alunos.filter(a => a.ativo).length;
  const totalProvasMes = provasPassadas.filter(p => p.data?.startsWith(mesAtual)).length;
  const getPg = (alunoId, chave) => pagamentos.find(p => p.aluno_id === alunoId && p.chave === chave);
  const receitaMes = alunos.reduce((s, a) => s + (getPg(a.id, mesAtual)?.status === "pago" ? +a.mensalidade || 0 : 0), 0);
  const emDebito = alunos.filter(a => { const pg = getPg(a.id, mesAtual); return !pg || pg.status === "pendente"; }).length;

  const rankingPace = alunos.map(a => {
    const ps = provasPassadas.filter(p => p.aluno_id === a.id).map(p => paceParaSegundos(p.pace)).filter(v => v !== null && !isNaN(v));
    const avg = ps.length ? ps.reduce((s, v) => s + v, 0) / ps.length : null;
    return { nome: a.nome.split(" ")[0], pace: avg };
  }).filter(r => r.pace).sort((a, b) => a.pace - b.pace).map(r => ({ ...r, paceStr: `${Math.floor(r.pace / 60)}:${(r.pace % 60).toFixed(0).padStart(2, "0")}` }));

  const receitaMeses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { mes: nomeMes(d.getMonth()).slice(0, 3), receita: alunos.reduce((s, a) => s + (getPg(a.id, k)?.status === "pago" ? +a.mensalidade || 0 : 0), 0) };
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <CardResumo label="Alunos Ativos" valor={totalAtivos} icone={<Users size={20} />} />
        <CardResumo label="Provas este Mês" valor={totalProvasMes} icone={<Award size={20} />} cor="#0088CC" />
        <CardResumo label="Receita do Mês" valor={`R$ ${receitaMes}`} icone={<DollarSign size={20} />} cor="#00A859" />
        <CardResumo label="Em Débito" valor={emDebito} icone={<AlertCircle size={20} />} cor="#E74C3C" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
          <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={receitaMeses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="mes" stroke="#555" tick={{ fill: "#666", fontSize: 11 }} />
              <YAxis stroke="#555" tick={{ fill: "#666", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} itemStyle={{ color: "#00A859" }} />
              <Bar dataKey="receita" fill="#00A859" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
          <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Ranking por Pace Médio</h3>
          {rankingPace.length === 0 && <p style={{ color: "#555", fontSize: 13 }}>Sem dados suficientes</p>}
          {rankingPace.map((r, i) => (
            <div key={r.nome} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
              <span style={{ color: i === 0 ? "#F39C12" : "#555", fontWeight: 800, fontSize: 16, minWidth: 24 }}>#{i + 1}</span>
              <span style={{ flex: 1, color: "#fff", fontWeight: 600 }}>{r.nome}</span>
              <span style={{ background: "#00A85922", color: "#00A859", padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>{r.paceStr} min/km</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function EndorfinaClub() {
  // Estado dos dados vindos do Supabase
  const [alunos, setAlunos] = useState([]);
  const [provasPassadas, setProvasPassadas] = useState([]);
  const [provasFuturas, setProvasFuturas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // UI
  const [abaAtiva, setAbaAtiva] = useState("alunos");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [modalNovoAluno, setModalNovoAluno] = useState(false);
  const [formNovoAluno, setFormNovoAluno] = useState({ nome: "", idade: "", cidade: "", telefone: "", email: "", plano: "Básico", mensalidade: 200, foto: "", data_inicio: new Date().toISOString().slice(0, 10), ativo: true });
  const [toast, setToast] = useState(null);

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // Carrega todos os dados do Supabase
  const carregarTudo = async () => {
    setCarregando(true);
    try {
      const [a, pp, pf, pg, ev, tr] = await Promise.all([
        sb.from("alunos").select("*").order("nome"),
        sb.from("provas_passadas").select("*").order("data", { ascending: false }),
        sb.from("provas_futuras").select("*").order("data"),
        sb.from("pagamentos").select("*"),
        sb.from("eventos_calendario").select("*").order("data"),
        sb.from("treinos").select("*"),
      ]);
      setAlunos(a.data || []);
      setProvasPassadas(pp.data || []);
      setProvasFuturas(pf.data || []);
      setPagamentos(pg.data || []);
      setEventos(ev.data || []);
      setTreinos(tr.data || []);
    } catch (e) {
      mostrarToast("Erro ao carregar dados", "erro");
    }
    setCarregando(false);
  };

  useEffect(() => { carregarTudo(); }, []);

  // Gerenciamento de ações com Supabase
  const onUpdate = useCallback(async (acao, payload) => {
    try {
      switch (acao) {
        case "editarAluno": {
          const { id, nome, idade, cidade, telefone, email, plano, mensalidade, foto, data_inicio, ativo } = payload;
          await sb.from("alunos").update({ nome, idade, cidade, telefone, email, plano, mensalidade, foto, data_inicio, ativo }).eq("id", id);
          setAlunos(prev => prev.map(a => a.id === id ? { ...a, ...payload } : a));
          break;
        }
        case "addProvaPassada": {
          const nova = { id: gerarId(), aluno_id: payload.alunoId, data: "", nome: "", distancia: null, tempo: "", pace: "" };
          await sb.from("provas_passadas").insert(nova);
          setProvasPassadas(prev => [...prev, nova]);
          break;
        }
        case "removeProvaPassada": {
          const p = provasPassadas.filter(p => p.aluno_id === payload.alunoId)[payload.index];
          if (p) { await sb.from("provas_passadas").delete().eq("id", p.id); setProvasPassadas(prev => prev.filter(x => x.id !== p.id)); }
          break;
        }
        case "editProvaPassada": {
          const lista = provasPassadas.filter(p => p.aluno_id === payload.alunoId);
          const p = lista[payload.index];
          if (!p) break;
          const atualizado = { ...p, [payload.key]: payload.val };
          if ((payload.key === "tempo" || payload.key === "distancia") && atualizado.tempo && atualizado.distancia) {
            atualizado.pace = calcularPace(+atualizado.distancia, atualizado.tempo);
          }
          await sb.from("provas_passadas").update(atualizado).eq("id", p.id);
          setProvasPassadas(prev => prev.map(x => x.id === p.id ? atualizado : x));
          break;
        }
        case "addProvaFutura": {
          const nova = { id: gerarId(), aluno_id: payload.alunoId, data: "", nome: "", distancia: null, objetivo_tempo: "", objetivo_pace: "" };
          await sb.from("provas_futuras").insert(nova);
          setProvasFuturas(prev => [...prev, nova]);
          break;
        }
        case "removeProvaFutura": {
          const p = provasFuturas.filter(p => p.aluno_id === payload.alunoId)[payload.index];
          if (p) { await sb.from("provas_futuras").delete().eq("id", p.id); setProvasFuturas(prev => prev.filter(x => x.id !== p.id)); }
          break;
        }
        case "editProvaFutura": {
          const lista = provasFuturas.filter(p => p.aluno_id === payload.alunoId);
          const p = lista[payload.index];
          if (!p) break;
          const atualizado = { ...p, [payload.key]: payload.val };
          await sb.from("provas_futuras").update(atualizado).eq("id", p.id);
          setProvasFuturas(prev => prev.map(x => x.id === p.id ? atualizado : x));
          break;
        }
        case "addEvento": {
          const { id, alunoId, nome, distancia, tipo, data } = payload;
          const novo = { id, aluno_id: alunoId, nome, distancia, tipo, data };
          await sb.from("eventos_calendario").insert(novo);
          setEventos(prev => [...prev, novo]);
          break;
        }
        case "editarEvento": {
          const { id, alunoId, nome, distancia, tipo, data } = payload;
          await sb.from("eventos_calendario").update({ aluno_id: alunoId, nome, distancia, tipo, data }).eq("id", id);
          setEventos(prev => prev.map(e => e.id === id ? { ...e, aluno_id: alunoId, nome, distancia, tipo, data } : e));
          break;
        }
        case "removerEvento": {
          await sb.from("eventos_calendario").delete().eq("id", payload.id);
          setEventos(prev => prev.filter(e => e.id !== payload.id));
          break;
        }
        case "setPagamento": {
          const { alunoId, chave, status, data, obs } = payload;
          const existente = pagamentos.find(p => p.aluno_id === alunoId && p.chave === chave);
          if (existente) {
            await sb.from("pagamentos").update({ status, data, obs }).eq("id", existente.id);
            setPagamentos(prev => prev.map(p => p.id === existente.id ? { ...p, status, data, obs } : p));
          } else {
            const { data: novo } = await sb.from("pagamentos").insert({ aluno_id: alunoId, chave, status, data, obs }).select().single();
            if (novo) setPagamentos(prev => [...prev, novo]);
          }
          break;
        }
        case "setObsPagamento": {
          const { alunoId, chave, obs } = payload;
          const existente = pagamentos.find(p => p.aluno_id === alunoId && p.chave === chave);
          if (existente) {
            await sb.from("pagamentos").update({ obs }).eq("id", existente.id);
            setPagamentos(prev => prev.map(p => p.id === existente.id ? { ...p, obs } : p));
          }
          break;
        }
        case "editMensalidade": {
          await sb.from("alunos").update({ mensalidade: payload.valor }).eq("id", payload.id);
          setAlunos(prev => prev.map(a => a.id === payload.id ? { ...a, mensalidade: payload.valor } : a));
          break;
        }
        case "editarTreino": {
          const { alunoId, chave, campo, valor, treino } = payload;
          const existente = treinos.find(t => t.aluno_id === alunoId && t.chave === chave);
          const atualizado = { ...treino, [campo]: valor };
          if (existente) {
            await sb.from("treinos").update({ tipo: atualizado.tipo, distancia: atualizado.distancia, obs: atualizado.obs }).eq("id", existente.id);
            setTreinos(prev => prev.map(t => t.id === existente.id ? { ...t, [campo]: valor } : t));
          } else {
            const { data: novo } = await sb.from("treinos").insert({ aluno_id: alunoId, chave, tipo: atualizado.tipo || "", distancia: atualizado.distancia || "", obs: atualizado.obs || "" }).select().single();
            if (novo) setTreinos(prev => [...prev, novo]);
          }
          break;
        }
      }
    } catch (e) {
      console.error(acao, e);
      mostrarToast("Erro ao salvar", "erro");
    }
  }, [provasPassadas, provasFuturas, pagamentos, treinos]);

  const adicionarAluno = async () => {
    if (!formNovoAluno.nome.trim()) return;
    const novo = { ...formNovoAluno, id: gerarId() };
    try {
      await sb.from("alunos").insert(novo);
      setAlunos(prev => [...prev, novo]);
      setModalNovoAluno(false);
      setFormNovoAluno({ nome: "", idade: "", cidade: "", telefone: "", email: "", plano: "Básico", mensalidade: 200, foto: "", data_inicio: new Date().toISOString().slice(0, 10), ativo: true });
      mostrarToast("Aluno adicionado!");
    } catch (e) {
      mostrarToast("Erro ao adicionar aluno", "erro");
    }
  };

  const removerAluno = async (id) => {
    if (!confirm("Remover este aluno e todos os seus dados?")) return;
    try {
      await sb.from("alunos").delete().eq("id", id);
      setAlunos(prev => prev.filter(a => a.id !== id));
      setProvasPassadas(prev => prev.filter(p => p.aluno_id !== id));
      setProvasFuturas(prev => prev.filter(p => p.aluno_id !== id));
      setPagamentos(prev => prev.filter(p => p.aluno_id !== id));
      setTreinos(prev => prev.filter(t => t.aluno_id !== id));
      if (alunoSelecionado === id) setAlunoSelecionado(null);
      mostrarToast("Aluno removido");
    } catch (e) {
      mostrarToast("Erro ao remover", "erro");
    }
  };

  const abas = [
    { id: "alunos", label: "Alunos", icone: <Users size={17} /> },
    { id: "calendario", label: "Calendário", icone: <Calendar size={17} /> },
    { id: "financeiro", label: "Financeiro", icone: <DollarSign size={17} /> },
    { id: "calculadora", label: "Calculadora", icone: <Calculator size={17} /> },
    { id: "planilha", label: "Planilha", icone: <ClipboardList size={17} /> },
    { id: "relatorios", label: "Relatórios", icone: <BarChart2 size={17} /> },
  ];

  const alunoAtual = alunos.find(a => a.id === alunoSelecionado);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#000", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #000; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: #1a1a1a; color: #fff; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: sidebarAberta ? 240 : 64, minWidth: sidebarAberta ? 240 : 64, background: "#0a0a0a", borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", transition: "width 0.25s, min-width 0.25s", overflow: "hidden" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarAberta ? "flex-start" : "center" }}>
          <div style={{ background: "#00A859", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          {sidebarAberta && <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: -0.5 }}>Endorfina</span><span style={{ color: "#00A859", fontWeight: 900, fontSize: 16, letterSpacing: -0.5 }}> Club</span></div>}
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", overflow: "auto" }}>
          {abas.map(aba => (
            <button key={aba.id} onClick={() => { setAbaAtiva(aba.id); if (aba.id !== "alunos") setAlunoSelecionado(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sidebarAberta ? "10px 12px" : "10px", justifyContent: sidebarAberta ? "flex-start" : "center", background: abaAtiva === aba.id ? "#00A85922" : "transparent", border: "none", borderRadius: 9, color: abaAtiva === aba.id ? "#00A859" : "#666", cursor: "pointer", marginBottom: 2, fontWeight: abaAtiva === aba.id ? 700 : 500, fontSize: 14, whiteSpace: "nowrap" }}>
              {aba.icone}{sidebarAberta && aba.label}
            </button>
          ))}
        </nav>

        {abaAtiva === "alunos" && sidebarAberta && (
          <div style={{ borderTop: "1px solid #1a1a1a", maxHeight: 320, overflow: "auto" }}>
            <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#555", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Alunos</span>
              <button onClick={() => setModalNovoAluno(true)} style={{ background: "#00A85922", border: "none", borderRadius: 6, padding: "3px 8px", color: "#00A859", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700 }}><Plus size={11} /> Novo</button>
            </div>
            {alunos.map(a => (
              <div key={a.id} onClick={() => setAlunoSelecionado(a.id)} style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: alunoSelecionado === a.id ? "#00A85915" : "transparent", borderLeft: alunoSelecionado === a.id ? "2px solid #00A859" : "2px solid transparent" }}>
                <Avatar nome={a.nome} foto={a.foto} size={28} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ color: "#ddd", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.nome.split(" ")[0]} {a.nome.split(" ").slice(-1)[0]}</div>
                  <div style={{ color: a.ativo ? "#00A859" : "#555", fontSize: 10, fontWeight: 700 }}>{a.ativo ? "Ativo" : "Inativo"}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removerAluno(a.id); }} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: 4 }}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => setSidebarAberta(s => !s)} style={{ margin: 12, background: "#1a1a1a", border: "1px solid #222", borderRadius: 8, padding: 9, color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Menu size={16} />
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            {abaAtiva === "alunos" && alunoSelecionado ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setAlunoSelecionado(null)} style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 8, padding: "6px 12px", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}><ChevronLeft size={14} /> Voltar</button>
                <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>{alunoAtual?.nome}</h1>
              </div>
            ) : (
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>{abas.find(a => a.id === abaAtiva)?.label}</h1>
            )}
          </div>
          {abaAtiva === "alunos" && !alunoSelecionado && <Btn onClick={() => setModalNovoAluno(true)} icone={<Plus size={15} />}>Novo Aluno</Btn>}
        </div>

        {carregando ? <Spinner /> : (
          <>
            {abaAtiva === "alunos" && (
              alunoSelecionado && alunoAtual ? (
                <DashboardAluno
                  aluno={alunoAtual}
                  provasPassadas={provasPassadas.filter(p => p.aluno_id === alunoSelecionado)}
                  provasFuturas={provasFuturas.filter(p => p.aluno_id === alunoSelecionado)}
                  onUpdate={onUpdate}
                  toast={mostrarToast}
                />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {alunos.map(aluno => (
                    <div key={aluno.id} onClick={() => setAlunoSelecionado(aluno.id)} style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20, cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                        <Avatar nome={aluno.nome} foto={aluno.foto} size={48} />
                        <div>
                          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{aluno.nome}</div>
                          <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{aluno.plano} · {aluno.cidade}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ background: aluno.ativo ? "#00A85922" : "#33333322", color: aluno.ativo ? "#00A859" : "#666", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{aluno.ativo ? "Ativo" : "Inativo"}</span>
                        <span style={{ background: "#1a1a1a", color: "#888", fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>{provasPassadas.filter(p => p.aluno_id === aluno.id).length} provas</span>
                        <span style={{ background: "#1a1a1a", color: "#888", fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>R$ {aluno.mensalidade}/mês</span>
                      </div>
                    </div>
                  ))}
                  {alunos.length === 0 && <div style={{ color: "#444", fontSize: 15, gridColumn: "1/-1", textAlign: "center", padding: 60 }}>Nenhum aluno cadastrado. Clique em "Novo Aluno" para começar.</div>}
                </div>
              )
            )}
            {abaAtiva === "calendario" && <AbaCalendario alunos={alunos} eventos={eventos} onUpdate={onUpdate} toast={mostrarToast} />}
            {abaAtiva === "financeiro" && <AbaFinanceiro alunos={alunos} pagamentos={pagamentos} onUpdate={onUpdate} toast={mostrarToast} />}
            {abaAtiva === "calculadora" && <AbaCalculadora />}
            {abaAtiva === "planilha" && <AbaPlanilha alunos={alunos} treinos={treinos} onUpdate={onUpdate} toast={mostrarToast} />}
            {abaAtiva === "relatorios" && <AbaRelatorios alunos={alunos} provasPassadas={provasPassadas} pagamentos={pagamentos} />}
          </>
        )}
      </div>

      {/* Modal novo aluno */}
      {modalNovoAluno && (
        <Modal titulo="Adicionar Novo Aluno" onClose={() => setModalNovoAluno(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}><Campo label="Nome completo *" value={formNovoAluno.nome} onChange={v => setFormNovoAluno({ ...formNovoAluno, nome: v })} placeholder="Ex: João da Silva" /></div>
            <Campo label="Idade" value={formNovoAluno.idade} onChange={v => setFormNovoAluno({ ...formNovoAluno, idade: v })} type="number" placeholder="Ex: 30" />
            <Campo label="Cidade" value={formNovoAluno.cidade} onChange={v => setFormNovoAluno({ ...formNovoAluno, cidade: v })} placeholder="Ex: Porto Alegre" />
            <Campo label="Telefone" value={formNovoAluno.telefone} onChange={v => setFormNovoAluno({ ...formNovoAluno, telefone: v })} placeholder="(51) 99999-9999" />
            <Campo label="Email" value={formNovoAluno.email} onChange={v => setFormNovoAluno({ ...formNovoAluno, email: v })} type="email" />
            <Campo label="Plano" value={formNovoAluno.plano} onChange={v => setFormNovoAluno({ ...formNovoAluno, plano: v })} placeholder="Ex: Elite" />
            <Campo label="Mensalidade (R$)" value={formNovoAluno.mensalidade} onChange={v => setFormNovoAluno({ ...formNovoAluno, mensalidade: v })} type="number" />
            <Campo label="Data de início" value={formNovoAluno.data_inicio} onChange={v => setFormNovoAluno({ ...formNovoAluno, data_inicio: v })} type="date" />
            <div style={{ gridColumn: "1/-1" }}><Campo label="URL da foto (opcional)" value={formNovoAluno.foto} onChange={v => setFormNovoAluno({ ...formNovoAluno, foto: v })} placeholder="https://..." /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <Btn variante="fantasma" onClick={() => setModalNovoAluno(false)}>Cancelar</Btn>
            <Btn onClick={adicionarAluno} icone={<Plus size={14} />} disabled={!formNovoAluno.nome.trim()}>Adicionar Aluno</Btn>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </div>
  );
}
