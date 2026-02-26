import { useState } from "react";

const screens = [
  "スプラッシュ","ログイン","オンボーディング","ホーム","本棚","書籍検索",
  "書籍詳細","セッション開始","読書セッション","外部アプリ読書中",
  "セッション完了","あとから記録","統計","プロフィール/設定",
];
const ids = ["S-01","S-03","S-02","S-04","S-05","S-06","S-07","S-08a","S-08","S-08b","S-09","S-08c","S-10","S-11"];

const C = {
  brand: "#2D3142", accent: "#F5A623", accentBg: "#FFF3DC",
  bg: "#F8F7F4", text: "#2D3142", sub: "#7A7D8E", muted: "#B8BAC8",
  border: "#E8E9EE", green: "#34C759", dark: "#1A1B2E", darkCard: "rgba(255,255,255,0.05)",
};

const cardStyle = { background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };

function Cover({ title, bg, w=48, h=64, fs=9 }) {
  return (
    <div style={{ width: w, height: h, background: bg, borderRadius: 10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,255,255,0.2),transparent)" }}/>
      <span style={{ fontSize: fs, color: "#666", textAlign:"center", padding: 4, lineHeight: 1.3, fontWeight: 600, position:"relative", whiteSpace:"pre-line" }}>{title}</span>
    </div>
  );
}

function Phone({ children, title, dark }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 2, textTransform:"uppercase", marginBottom: 8 }}>{title}</p>
      <div style={{ width: 375, height: 812, background: dark ? C.dark : C.bg, borderRadius: 40, border: `3px solid ${C.border}`, overflow:"hidden", display:"flex", flexDirection:"column", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding: "12px 32px 4px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#666" : "#666" }}>9:41</span>
          <div style={{ display:"flex", gap: 4, alignItems:"center" }}>
            <div style={{ display:"flex", gap: 2 }}>
              {[5,7,9,11].map((h,i)=><div key={i} style={{ width:3, height:h, background: dark?"#555":"#999", borderRadius:1 }}/>)}
            </div>
            <div style={{ width: 24, height: 12, border: `1.5px solid ${dark?"#555":"#999"}`, borderRadius: 3, marginLeft: 4, display:"flex", alignItems:"center", padding: 1.5 }}>
              <div style={{ width: 16, height: 7, background: dark?"#555":"#999", borderRadius: 1.5 }}/>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY:"auto", display:"flex", flexDirection:"column" }}>{children}</div>
      </div>
    </div>
  );
}

function Nav({ active=0 }) {
  const items = [{l:"ホーム",d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"},{l:"本棚",d:"M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"},{l:"統計",d:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"},{l:"設定",d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"}];
  return (
    <div style={{ display:"flex", borderTop: `1px solid ${C.border}`, background:"#fff", padding:"8px 0 20px", marginTop:"auto" }}>
      {items.map((it,i)=>(
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap: 2 }}>
          <svg width="20" height="20" fill="none" stroke={i===active?C.brand:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={it.d}/></svg>
          <span style={{ fontSize: 10, fontWeight: 600, color: i===active?C.brand:C.muted }}>{it.l}</span>
        </div>
      ))}
    </div>
  );
}

function Btn({ children, outline, style: s }) {
  return (
    <div style={{ width:"100%", padding: outline?"12px 24px":"14px 24px", borderRadius: 16, background: outline?"transparent":C.brand, color: outline?C.sub:"#fff", border: outline?`2px solid ${C.border}`:"none", fontSize: 14, fontWeight: 700, textAlign:"center", boxShadow: outline?"none":`0 4px 12px rgba(45,49,66,0.2)`, cursor:"pointer", ...s }}>{children}</div>
  );
}

function Label({ children }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: 1.5, textTransform:"uppercase", marginBottom: 8 }}>{children}</p>;
}

function Splash() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"linear-gradient(135deg, #2D3142, #3D4162, #4A4E69)" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:96, height:96, background:"rgba(255,255,255,0.1)", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.15)", marginBottom:24 }}>
          <span style={{ fontSize: 48 }}>📖</span>
        </div>
        <p style={{ fontSize: 32, fontWeight: 900, color:"#fff", letterSpacing: -1 }}>BookLoop</p>
        <p style={{ fontSize: 14, color:"rgba(255,255,255,0.4)", marginTop:8, fontWeight:500 }}>読む → 考える → 動く</p>
      </div>
      <div style={{ display:"flex", justifyContent:"center", paddingBottom: 48 }}>
        <div style={{ width:32, height:32, border:"3px solid rgba(255,255,255,0.15)", borderTop:"3px solid rgba(255,255,255,0.7)", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState(0);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#fff" }}>
      <div style={{ padding:"32px 24px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:32 }}>
          <div style={{ width:40, height:40, background:C.brand, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:18 }}>📖</span></div>
          <span style={{ fontSize:20, fontWeight:900, color:C.brand }}>BookLoop</span>
        </div>
        <div style={{ display:"flex", background:C.bg, borderRadius:16, padding:4, marginBottom:24 }}>
          {["ログイン","新規登録"].map((t,i)=>(
            <button key={i} onClick={()=>setMode(i)} style={{ flex:1, padding:"10px 0", borderRadius:12, fontSize:14, fontWeight:700, border:"none", cursor:"pointer", background:i===mode?"#fff":"transparent", color:i===mode?C.brand:C.muted, boxShadow:i===mode?"0 1px 4px rgba(0,0,0,0.06)":"none", transition:"all 0.2s" }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, padding:"0 24px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
          {[{icon:"G", label:"Google", bg:"#fff", color:C.brand, border:`2px solid ${C.border}`},
            {icon:"", label:"Apple", bg:"#000", color:"#fff", border:"none"}
          ].map((b,i)=>(
            <button key={i} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, width:"100%", padding:"14px 0", borderRadius:16, background:b.bg, color:b.color, border:b.border, fontSize:14, fontWeight:600, cursor:"pointer" }}>
              {i===0?<span style={{fontWeight:700,fontSize:16}}>G</span>:<span style={{fontSize:16}}>🍎</span>}
              {b.label} で{mode===0?"ログイン":"登録"}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
          <div style={{ flex:1, height:1, background:C.border }}/><span style={{ fontSize:12, color:C.muted, fontWeight:500 }}>または</span><div style={{ flex:1, height:1, background:C.border }}/>
        </div>
        {[{l:"メールアドレス",p:"you@example.com",icon:"✉️"},
          {l:"パスワード",p:"••••••••",icon:"🔒"},
          ...(mode===1?[{l:"表示名",p:"あなたのニックネーム",icon:"👤"}]:[])
        ].map((f,i)=>(
          <div key={i} style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.sub, display:"block", marginBottom:6 }}>{f.l}</label>
            <div style={{ display:"flex", alignItems:"center", background:C.bg, borderRadius:16, padding:"14px 16px", border:`2px solid transparent` }}>
              <span style={{ marginRight:12, fontSize:13 }}>{f.icon}</span>
              <span style={{ fontSize:14, color:C.muted }}>{f.p}</span>
            </div>
          </div>
        ))}
        {mode===0&&<p style={{ fontSize:12, color:C.accent, textAlign:"right", marginTop:-4, fontWeight:600 }}>パスワードを忘れた方</p>}
        <Btn style={{ marginTop: 20 }}>{mode===0?"ログイン":"アカウントを作成"}</Btn>
      </div>
      <p style={{ fontSize:10, color:C.muted, textAlign:"center", padding:"0 32px 24px", lineHeight:1.5 }}>
        続行することで、<span style={{color:C.brand,fontWeight:600}}>利用規約</span>および<span style={{color:C.brand,fontWeight:600}}>プライバシーポリシー</span>に同意したものとみなされます。
      </p>
    </div>
  );
}

function Onboarding() {
  const [step, setStep] = useState(0);
  const Dots = ({s}) => <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:24}}>{[0,1,2].map(i=><div key={i} style={{height:6,borderRadius:3,background:i===s?C.accent:C.border,width:i===s?24:6,transition:"all 0.3s"}}/>)}</div>;
  const steps = [
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 32px" }} key={0}>
      <div style={{ width:140, height:140, background:`linear-gradient(135deg, ${C.accentBg}, #FFE7B3)`, borderRadius:32, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:32, boxShadow:`0 8px 24px rgba(245,166,35,0.15)` }}><span style={{ fontSize:64 }}>📚</span></div>
      <p style={{ fontSize:24, fontWeight:900, color:C.brand, textAlign:"center", lineHeight:1.4 }}>読書を、<br/>毎日の習慣に。</p>
      <p style={{ fontSize:14, color:C.sub, textAlign:"center", marginTop:16, lineHeight:1.8 }}>BookLoop は読書セッションを記録し、<br/>ストリークで継続をサポートします。</p>
      <Dots s={0}/>
    </div>,
    <div style={{ flex:1, padding:"32px 24px 0" }} key={1}>
      <p style={{ fontSize:24, fontWeight:900, color:C.brand, lineHeight:1.3 }}>読書目標を<br/>決めよう 🎯</p>
      <p style={{ fontSize:14, color:C.sub, marginTop:8 }}>あとで変更できるので、気軽に選んでね</p>
      <div style={{ marginTop:28 }}>
        <Label>週に何日読む？</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[3,4,5,7].map(d=>(
            <div key={d} style={{ borderRadius:16, padding:"14px 0", textAlign:"center", background:d===5?C.brand:"#fff", color:d===5?"#fff":C.brand, border:d===5?"none":`2px solid ${C.border}`, boxShadow:d===5?`0 4px 12px rgba(45,49,66,0.2)`:"none" }}>
              <p style={{ fontSize:20, fontWeight:900 }}>{d}</p>
              <p style={{ fontSize:10, opacity:0.6, fontWeight:500, marginTop:2 }}>日/週</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop:24 }}>
        <Label>月に何冊読みたい？</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[1,2,3,4].map(d=>(
            <div key={d} style={{ borderRadius:16, padding:"14px 0", textAlign:"center", background:d===2?C.brand:"#fff", color:d===2?"#fff":C.brand, border:d===2?"none":`2px solid ${C.border}`, boxShadow:d===2?`0 4px 12px rgba(45,49,66,0.2)`:"none" }}>
              <p style={{ fontSize:20, fontWeight:900 }}>{d}</p>
              <p style={{ fontSize:10, opacity:0.6, fontWeight:500, marginTop:2 }}>冊/月</p>
            </div>
          ))}
        </div>
      </div>
      <Dots s={1}/>
    </div>,
    <div style={{ flex:1, padding:"32px 24px 0" }} key={2}>
      <p style={{ fontSize:24, fontWeight:900, color:C.brand, lineHeight:1.3 }}>最初の 1 冊を<br/>追加しよう 📖</p>
      <p style={{ fontSize:14, color:C.sub, marginTop:8 }}>今読んでいる本、これから読みたい本</p>
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", borderRadius:16, padding:"14px 16px", marginTop:20, border:`2px solid ${C.border}` }}>
        <span style={{color:C.muted}}>🔍</span><span style={{fontSize:14,color:C.muted}}>タイトル・ISBN で検索...</span>
      </div>
      <Label>おすすめ</Label>
      {[{t:"嫌われる勇気",a:"岸見一郎",c:"#B2DFDB"},{t:"FACTFULNESS",a:"ハンス・ロスリング",c:"#FFE0B2"},{t:"コンビニ人間",a:"村田沙耶香",c:"#FFECB3"}].map((b,i)=>(
        <div key={i} style={{ ...cardStyle, padding:14, display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <Cover title={b.t.slice(0,4)} bg={b.c} w={44} h={56}/>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.brand }}>{b.t}</p>
            <p style={{ fontSize:12, color:C.sub, marginTop:2 }}>{b.a}</p>
          </div>
          <span style={{ fontSize:12, fontWeight:600, color:C.accent, background:C.accentBg, borderRadius:12, padding:"6px 12px" }}>＋追加</span>
        </div>
      ))}
      <Dots s={2}/>
    </div>,
  ];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bg }}>
      {steps[step]}
      <div style={{ padding:"0 24px 32px", display:"flex", flexDirection:"column", gap:8 }}>
        <Btn onClick={()=>setStep(s=>Math.min(2,s+1))}>{step===2?"さっそく読書をはじめよう！ 📖":"次へ"}</Btn>
        {step===2&&<p style={{ fontSize:14, color:C.muted, textAlign:"center", padding:8, fontWeight:500, cursor:"pointer" }}>あとで追加する</p>}
      </div>
    </div>
  );
}

function Home() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ fontSize:12, color:C.muted, fontWeight:500 }}>おはようございます</p>
          <p style={{ fontSize:20, fontWeight:900, color:C.brand }}>田中さん 👋</p>
        </div>
        <div style={{ width:40, height:40, borderRadius:20, background:`linear-gradient(135deg, ${C.accent}, #FF8A00)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700, boxShadow:`0 2px 8px rgba(245,166,35,0.3)` }}>田</div>
      </div>
      <div style={{ margin:"12px 20px 0", padding:20, borderRadius:24, background:`linear-gradient(135deg, ${C.brand}, #4A4E69)`, color:"#fff", boxShadow:`0 8px 24px rgba(45,49,66,0.3)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:10, letterSpacing:2, opacity:0.5, fontWeight:600, textTransform:"uppercase" }}>Current Streak</p>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginTop:4 }}>
              <span style={{ fontSize:48, fontWeight:900 }}>12</span>
              <span style={{ fontSize:16, fontWeight:600, opacity:0.8 }}>日連続 🔥</span>
            </div>
          </div>
          <div style={{ textAlign:"right", background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"8px 12px" }}>
            <p style={{ fontSize:10, opacity:0.6 }}>最長記録</p>
            <p style={{ fontSize:14, fontWeight:900 }}>28 日</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, marginTop:16 }}>
          {["月","火","水","木","金","土","日"].map((d,i)=>(
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:28, height:28, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", background: i<5?C.accent:i===5?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)", border: i===5?"1px solid rgba(255,255,255,0.3)":"none" }}>
                {i<5&&<span style={{ fontSize:12, color:"#fff" }}>✓</span>}
              </div>
              <span style={{ fontSize:10, opacity:0.5, fontWeight:500 }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin:"16px 20px 0" }}>
        <Label>今日の目標</Label>
        <div style={{ ...cardStyle, padding:16, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:20, background:C.accentBg, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{fontSize:18}}>📖</span></div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:600, color:C.brand }}>今日まだ読書していません</p>
            <div style={{ width:"100%", height:8, background:C.bg, borderRadius:4, marginTop:6 }}><div style={{ width:0, height:8, background:C.accent, borderRadius:4 }}/></div>
          </div>
        </div>
      </div>
      <div style={{ margin:"20px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <Label>読書中</Label>
          <p style={{ fontSize:12, color:C.accent, fontWeight:600 }}>すべて見る →</p>
        </div>
        {[{t:"イシューからはじめよ",a:"安宅和人",pg:"67%",c:"#BBDEFB"},{t:"ノルウェイの森",a:"村上春樹",pg:"34%",c:"#C8E6C9"}].map((b,i)=>(
          <div key={i} style={{ ...cardStyle, padding:16, display:"flex", gap:12, marginBottom:8 }}>
            <Cover title={b.t.slice(0,5)} bg={b.c}/>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:700, color:C.brand }}>{b.t}</p>
              <p style={{ fontSize:12, color:C.sub, marginTop:2 }}>{b.a}</p>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
                <div style={{ flex:1, height:6, background:C.bg, borderRadius:3 }}><div style={{ height:6, background:C.brand, borderRadius:3, width:b.pg }}/></div>
                <span style={{ fontSize:11, fontWeight:600, color:C.sub }}>{b.pg}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ margin:"16px 20px 8px", display:"flex", flexDirection:"column", gap:8 }}>
        <Btn>📖 読書をはじめる</Btn>
        <Btn outline>🕐 あとから記録</Btn>
      </div>
      <Nav active={0}/>
    </div>
  );
}

function Bookshelf() {
  const [ti, setTi] = useState(1);
  const tabs=["読みたい","読書中","読了"];
  const books=[
    [{t:"FACT\nFULNESS",c:"#FFE0B2"},{t:"思考の\n整理学",c:"#E1BEE7"},{t:"火花",c:"#FFCDD2"},{t:"LEAN IN",c:"#FFF9C4"}],
    [{t:"イシューから\nはじめよ",c:"#BBDEFB"},{t:"ノルウェイ\nの森",c:"#C8E6C9"},{t:"リーダブル\nコード",c:"#F8BBD0"}],
    [{t:"嫌われる\n勇気",c:"#B2DFDB"},{t:"サピエンス\n全史",c:"#C5CAE9"},{t:"コンビニ\n人間",c:"#FFECB3"},{t:"ZERO to\nONE",c:"#B2EBF2"},{t:"1Q84",c:"#F8BBD0"}],
  ];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ fontSize:20, fontWeight:900, color:C.brand }}>本棚</p>
        <span style={{ fontSize:12, fontWeight:600, color:C.accent, background:C.accentBg, padding:"6px 12px", borderRadius:12 }}>{books.flat().length} 冊</span>
      </div>
      <div style={{ margin:"4px 20px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", borderRadius:16, padding:"12px 16px", border:`2px solid ${C.border}` }}>
          <span style={{color:C.muted}}>🔍</span>
          <span style={{ flex:1, fontSize:14, color:C.muted }}>タイトル・著者で検索...</span>
          <span style={{ fontSize:12, background:C.bg, color:C.muted, padding:"4px 8px", borderRadius:8, fontWeight:500 }}>📷</span>
        </div>
      </div>
      <div style={{ display:"flex", margin:"0 20px", borderBottom:`2px solid ${C.border}` }}>
        {tabs.map((t,i)=>(
          <button key={i} onClick={()=>setTi(i)} style={{ flex:1, textAlign:"center", padding:"10px 0", fontSize:14, fontWeight:600, border:"none", background:"none", cursor:"pointer", color:i===ti?C.brand:C.muted, borderBottom: i===ti?`3px solid ${C.accent}`:"3px solid transparent", transition:"all 0.2s" }}>
            {t}<span style={{ marginLeft:4, fontSize:11, color:C.muted }}>{books[i].length}</span>
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {books[ti].map((b,i)=>(
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ width:"100%", aspectRatio:"2/3", background:b.c, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", padding:8, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                <span style={{ fontSize:10, color:"#666", textAlign:"center", lineHeight:1.3, fontWeight:600, whiteSpace:"pre-line" }}>{b.t}</span>
              </div>
              <p style={{ fontSize:11, color:C.sub, marginTop:6, textAlign:"center", lineHeight:1.3, fontWeight:500 }}>{b.t.replace('\n',' ')}</p>
            </div>
          ))}
          <div style={{ width:"100%", aspectRatio:"2/3", borderRadius:12, border:`2px dashed ${C.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#fff", cursor:"pointer" }}>
            <div style={{ width:32, height:32, borderRadius:16, background:C.accentBg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}><span style={{ color:C.accent, fontWeight:700 }}>＋</span></div>
            <span style={{ fontSize:10, color:C.muted, fontWeight:500 }}>追加</span>
          </div>
        </div>
      </div>
      <Nav active={1}/>
    </div>
  );
}

function BookSearch() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 8px" }}><span style={{ fontSize:14, color:C.sub, fontWeight:500 }}>← 戻る</span></div>
      <div style={{ padding:"0 20px" }}>
        <p style={{ fontSize:20, fontWeight:900, color:C.brand, marginBottom:12 }}>書籍を追加</p>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", borderRadius:16, padding:"14px 16px", border:`2px solid ${C.brand}` }}>
          <span style={{color:C.sub}}>🔍</span><span style={{ fontSize:14, color:C.brand, fontWeight:500 }}>イシュー</span><span style={{ marginLeft:"auto", fontSize:12, color:C.muted }}>✕</span>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          {[{l:"タイトル",a:true},{l:"著者名"},{l:"ISBN"}].map((f,i)=>(<span key={i} style={{ fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:20, background:f.a?C.brand:"#fff", color:f.a?"#fff":C.sub, border:f.a?"none":`1px solid ${C.border}` }}>{f.l}</span>))}
          <span style={{ marginLeft:"auto", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:20, background:C.bg, color:C.sub }}>📷 バーコード</span>
        </div>
      </div>
      <div style={{ flex:1, padding:"16px 20px" }}>
        <Label>検索結果（3件）</Label>
        {[{t:"イシューからはじめよ",a:"安宅和人",p:"英治出版",pg:248,c:"#BBDEFB",added:true},{t:"イシューツリー活用術",a:"大嶋祥誉",p:"日経BP",pg:192,c:"#C5CAE9"},{t:"イシュー・セリング",a:"著者名",p:"出版社",pg:320,c:"#E0E0E0"}].map((b,i)=>(
          <div key={i} style={{ ...cardStyle, padding:16, display:"flex", gap:12, marginBottom:12 }}>
            <Cover title={b.t.slice(0,5)} bg={b.c} w={56} h={80}/>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:700, color:C.brand }}>{b.t}</p>
              <p style={{ fontSize:12, color:C.sub, marginTop:2 }}>{b.a}</p>
              <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>{b.p} · {b.pg}p</p>
              <div style={{ marginTop:8 }}>
                <span style={{ fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:12, background: b.added?"rgba(52,199,89,0.1)":C.accentBg, color: b.added?C.green:C.accent }}>{b.added?"✓ 追加済み":"＋ 本棚に追加"}</span>
              </div>
            </div>
          </div>
        ))}
        <div style={{ marginTop:16, paddingTop:16, borderTop:`2px dashed ${C.border}`, textAlign:"center" }}>
          <p style={{ fontSize:12, color:C.muted, marginBottom:12 }}>見つからない場合</p>
          <Btn outline>✏️ 手動で入力して追加</Btn>
        </div>
      </div>
    </div>
  );
}

function BookDetail() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 8px", display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:14, color:C.sub, fontWeight:500 }}>← 戻る</span><span style={{ color:C.muted }}>⋯</span></div>
      <div style={{ display:"flex", gap:16, padding:"0 20px", marginTop:8 }}>
        <Cover title={"イシューから\nはじめよ"} bg="#BBDEFB" w={96} h={144} fs={10}/>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:18, fontWeight:900, color:C.brand, lineHeight:1.3 }}>イシューからはじめよ</p>
          <p style={{ fontSize:14, color:C.sub, marginTop:4 }}>安宅和人</p>
          <p style={{ fontSize:12, color:C.muted, marginTop:2 }}>英治出版 · 248 ページ</p>
          <div style={{ display:"flex", gap:6, marginTop:10 }}>
            <span style={{ fontSize:11, fontWeight:600, background:C.bg, color:C.sub, padding:"4px 10px", borderRadius:20 }}>ビジネス</span>
            <span style={{ fontSize:11, fontWeight:600, background:"#E3F2FD", color:"#1976D2", padding:"4px 10px", borderRadius:20 }}>読書中</span>
          </div>
        </div>
      </div>
      <div style={{ margin:"20px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
          <span style={{ color:C.sub, fontWeight:500 }}>進捗</span><span style={{ fontWeight:700, color:C.brand }}>166 / 248 ページ (67%)</span>
        </div>
        <div style={{ width:"100%", height:12, background:C.bg, borderRadius:6, marginTop:8 }}><div style={{ width:"67%", height:12, background:`linear-gradient(90deg, ${C.brand}, #4A4E69)`, borderRadius:6 }}/></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, margin:"16px 20px 0" }}>
        {[{l:"読書時間",v:"4h 32m",icon:"⏱"},{l:"セッション",v:"8 回",icon:"📊"},{l:"開始日",v:"2/10",icon:"📅"}].map((s,i)=>(
          <div key={i} style={{ ...cardStyle, padding:12, textAlign:"center" }}>
            <p style={{ fontSize:18, marginBottom:4 }}>{s.icon}</p>
            <p style={{ fontSize:18, fontWeight:900, color:C.brand }}>{s.v}</p>
            <p style={{ fontSize:10, color:C.muted, fontWeight:500, marginTop:4 }}>{s.l}</p>
          </div>
        ))}
      </div>
      <div style={{ margin:"16px 20px 0", display:"flex", flexDirection:"column", gap:8 }}>
        <Btn>📖 続きを読む</Btn>
        <Btn outline>🕐 あとから記録</Btn>
      </div>
      <div style={{ margin:"20px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <Label>メモ</Label><p style={{ fontSize:12, fontWeight:600, color:C.accent }}>＋ 追加</p>
        </div>
        {[{pg:"p.45",t:"「解の質を上げる前に、イシューの質を上げろ」— 問い自体の見極めが最重要",d:"2/15"},{pg:"p.102",t:"仮説ドリブンのアプローチ。最初に仮説を立て、それを検証する構造で分析する",d:"2/18"}].map((m,i)=>(
          <div key={i} style={{ ...cardStyle, padding:14, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.accent, background:C.accentBg, padding:"2px 8px", borderRadius:4 }}>{m.pg}</span>
              <span style={{ fontSize:11, color:C.muted }}>{m.d}</span>
            </div>
            <p style={{ fontSize:14, color:C.brand, marginTop:8, lineHeight:1.6 }}>{m.t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionStart() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 8px" }}><span style={{ fontSize:14, color:C.sub, fontWeight:500 }}>← 戻る</span></div>
      <div style={{ flex:1, padding:"8px 20px" }}>
        <p style={{ fontSize:24, fontWeight:900, color:C.brand, textAlign:"center" }}>どこで読みますか？</p>
        <p style={{ fontSize:14, color:C.sub, textAlign:"center", marginTop:4 }}>読書方法を選んでセッションを開始</p>
        <div style={{ ...cardStyle, padding:16, display:"flex", gap:12, marginTop:20, alignItems:"center" }}>
          <Cover title="イシュー" bg="#BBDEFB"/><div style={{flex:1}}><p style={{fontSize:14,fontWeight:700,color:C.brand}}>イシューからはじめよ</p><p style={{fontSize:12,color:C.sub}}>安宅和人 · 166/248p</p></div><span style={{fontSize:12,color:C.accent,fontWeight:600}}>変更</span>
        </div>
        <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:12 }}>
          {[{icon:"📖",t:"このアプリで読む",s:"BookLoop 内でタイマー計測",bg:C.bg,sel:false},{icon:"📱",t:"外部アプリで読む",s:"Kindle / Kobo / Apple Books 等",bg:C.accentBg,sel:true}].map((o,i)=>(
            <div key={i} style={{ ...cardStyle, padding:20, cursor:"pointer", border: o.sel?`2px solid ${C.brand}`:`2px solid transparent`, boxShadow: o.sel?"0 4px 12px rgba(45,49,66,0.1)":"0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:48, height:48, background:o.bg, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{o.icon}</div>
                <div style={{flex:1}}><p style={{fontSize:14,fontWeight:700,color:C.brand}}>{o.t}</p><p style={{fontSize:12,color:C.sub,marginTop:2}}>{o.s}</p></div>
                <span style={{ color: o.sel?C.brand:C.muted }}>→</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:20 }}>
          <Label>よく使うアプリ</Label>
          <div style={{ display:"flex", gap:10 }}>
            {[{n:"Kindle",icon:"📙",s:true},{n:"Kobo",icon:"📘"},{n:"Apple\nBooks",icon:"📕"},{n:"その他",icon:"📗"}].map((a,i)=>(
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, borderRadius:16, padding:12, border: a.s?`2px solid ${C.brand}`:`2px solid ${C.border}`, background: a.s?C.bg:"#fff" }}>
                <span style={{fontSize:24}}>{a.icon}</span>
                <span style={{ fontSize:10, color:C.sub, textAlign:"center", lineHeight:1.3, whiteSpace:"pre-line", fontWeight:500 }}>{a.n}</span>
                {a.s&&<div style={{ width:8, height:8, borderRadius:4, background:C.brand }}/>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop:24 }}><Btn>タイマーを開始して Kindle で読む</Btn></div>
        <p style={{ fontSize:11, color:C.muted, textAlign:"center", marginTop:12, lineHeight:1.6 }}>タイマーはバックグラウンドで計測されます。<br/>読書が終わったら BookLoop に戻って終了してください。</p>
      </div>
    </div>
  );
}

function Session() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.dark, color:"#fff" }}>
      <div style={{ padding:"24px 20px 0", display:"flex", justifyContent:"space-between" }}>
        <span style={{ color:"rgba(255,255,255,0.35)", fontSize:14, fontWeight:500 }}>← 終了</span>
        <span style={{ color:"rgba(255,255,255,0.35)", fontSize:14 }}>⋮</span>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 20px" }}>
        <Cover title={"イシューから\nはじめよ"} bg="rgba(187,222,251,0.15)" w={64} h={96} fs={8}/>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", marginTop:12 }}>イシューからはじめよ</p>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:4 }}>安宅和人</p>
        <div style={{ marginTop:48 }}>
          <p style={{ fontSize:72, fontWeight:900, textAlign:"center", letterSpacing:-3, color:"#fff" }}>23:47</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:8 }}>
            <div style={{ width:8, height:8, borderRadius:4, background:C.accent, animation:"pulse 2s infinite" }}/>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)" }}>読書中...</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:24, marginTop:56 }}>
          <button style={{ width:56, height:56, borderRadius:28, border:"2px solid rgba(255,255,255,0.12)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><span style={{ fontSize:18, color:"rgba(255,255,255,0.35)" }}>⏸</span></button>
          <button style={{ width:80, height:80, borderRadius:40, background:"#fff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 4px 20px rgba(255,255,255,0.1)" }}><span style={{ fontSize:14, fontWeight:900, color:C.dark }}>終了</span></button>
          <button style={{ width:56, height:56, borderRadius:28, border:"2px solid rgba(255,255,255,0.12)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><span style={{ fontSize:18, color:"rgba(255,255,255,0.35)" }}>📝</span></button>
        </div>
      </div>
      <div style={{ padding:"0 20px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", borderRadius:16, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ color:"rgba(255,255,255,0.25)" }}>📝</span>
          <span style={{ fontSize:14, color:"rgba(255,255,255,0.25)" }}>気になったことをメモ...</span>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

function ExternalSession() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.dark, color:"#fff" }}>
      <div style={{ padding:"24px 20px 0", display:"flex", justifyContent:"space-between" }}>
        <span style={{ color:"rgba(255,255,255,0.35)", fontSize:14, fontWeight:500 }}>← 終了</span>
        <span style={{ color:"rgba(255,255,255,0.35)", fontSize:14 }}>⋮</span>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 20px" }}>
        <div style={{ width:64, height:64, background:"rgba(245,166,35,0.12)", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}><span style={{fontSize:32}}>📙</span></div>
        <span style={{ fontSize:12, fontWeight:600, background:"rgba(245,166,35,0.12)", color:C.accent, padding:"4px 12px", borderRadius:20 }}>Kindle で読書中</span>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", marginTop:12 }}>イシューからはじめよ</p>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:4 }}>安宅和人</p>
        <div style={{ marginTop:48 }}>
          <p style={{ fontSize:72, fontWeight:900, textAlign:"center", letterSpacing:-3, color:"#fff" }}>45:12</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:8 }}>
            <div style={{ width:8, height:8, borderRadius:4, background:C.accent, animation:"pulse 2s infinite" }}/>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)" }}>タイマー計測中</p>
          </div>
        </div>
        <div style={{ marginTop:40, width:"100%" }}>
          <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:20, padding:16, border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, background:"rgba(255,255,255,0.08)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📚</div>
              <div style={{flex:1}}><p style={{fontSize:11,color:"rgba(255,255,255,0.25)"}}>通知バーにも表示中</p><p style={{fontSize:14,color:"rgba(255,255,255,0.5)",fontWeight:500}}>BookLoop — 45:12 読書中</p></div>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:12, marginTop:32, width:"100%" }}>
          <button style={{ flex:1, padding:"16px 0", borderRadius:16, border:"2px solid rgba(255,255,255,0.08)", background:"transparent", cursor:"pointer" }}><span style={{ fontSize:14, color:"rgba(255,255,255,0.35)", fontWeight:500 }}>📝 メモ</span></button>
          <button style={{ flex:1, padding:"16px 0", borderRadius:16, background:"#fff", border:"none", cursor:"pointer", boxShadow:"0 4px 20px rgba(255,255,255,0.1)" }}><span style={{ fontSize:14, fontWeight:700, color:C.dark }}>読書を終了</span></button>
        </div>
      </div>
      <div style={{ padding:"0 20px 32px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.15)", textAlign:"center", lineHeight:1.6 }}>Kindle アプリに切り替えても<br/>タイマーはバックグラウンドで動き続けます</p></div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

function SessionComplete() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"24px 20px 0" }}><span style={{ fontSize:14, color:C.sub, fontWeight:500 }}>← 戻る</span></div>
      <div style={{ flex:1, padding:"16px 20px" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:80, height:80, background:`linear-gradient(135deg, ${C.accentBg}, #FFE7B3)`, borderRadius:40, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", boxShadow:`0 8px 24px rgba(245,166,35,0.15)` }}><span style={{fontSize:40}}>🎉</span></div>
          <p style={{ fontSize:20, fontWeight:900, color:C.brand, marginTop:16 }}>おつかれさまでした！</p>
          <p style={{ fontSize:14, color:C.sub, marginTop:4 }}>今日も読書を続けられました</p>
        </div>
        <div style={{ ...cardStyle, padding:20, marginTop:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {[{l:"読書時間",v:"23:47"},{l:"ストリーク",v:"13日🔥"},{l:"記録方法",v:"📙 Kindle",sm:true}].map((s,i)=>(
              <div key={i} style={{ textAlign:"center" }}><p style={{fontSize:10,color:C.muted,fontWeight:500}}>{s.l}</p><p style={{ fontSize:s.sm?14:24, fontWeight:900, color:C.brand, marginTop:s.sm?8:4 }}>{s.v}</p></div>
            ))}
          </div>
        </div>
        <div style={{ marginTop:20 }}>
          <Label>読んだページ</Label>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ ...cardStyle, flex:1, padding:12, textAlign:"center" }}><p style={{fontSize:10,color:C.muted}}>開始</p><p style={{fontSize:20,fontWeight:900,color:C.brand}}>166</p></div>
            <span style={{ color:C.muted, fontWeight:500 }}>→</span>
            <div style={{ ...cardStyle, flex:1, padding:12, textAlign:"center" }}><p style={{fontSize:10,color:C.muted}}>終了</p><p style={{fontSize:20,fontWeight:900,color:C.brand}}>189</p></div>
            <div style={{ textAlign:"center", padding:"0 8px" }}><p style={{fontSize:10,color:C.muted}}>読了</p><p style={{fontSize:20,fontWeight:900,color:C.accent}}>23p</p></div>
          </div>
        </div>
        <div style={{ marginTop:20 }}>
          <Label>メモ（任意）</Label>
          <div style={{ borderRadius:16, border:`2px dashed ${C.border}`, background:"#fff", padding:16, minHeight:80 }}><p style={{ fontSize:14, color:C.muted }}>この読書で気づいたこと、考えたことを書き留めよう...</p></div>
        </div>
        <div style={{ marginTop:24, marginBottom:24, display:"flex", flexDirection:"column", gap:8 }}>
          <Btn>保存する</Btn>
          <Btn outline>メモを書いてから保存</Btn>
        </div>
      </div>
    </div>
  );
}

function ManualLog() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", gap:12 }}><span style={{ fontSize:14, color:C.sub, fontWeight:500 }}>← 戻る</span><p style={{ fontSize:18, fontWeight:900, color:C.brand }}>あとから記録</p></div>
      <div style={{ flex:1, padding:"12px 20px", overflowY:"auto" }}>
        <p style={{ fontSize:14, color:C.sub, marginBottom:16 }}>過去 7 日以内の読書を記録できます</p>
        <div style={{ marginBottom:20 }}>
          <Label>読んだ本</Label>
          <div style={{ ...cardStyle, padding:16, display:"flex", alignItems:"center", gap:12 }}>
            <Cover title="イシュー" bg="#BBDEFB"/><div style={{flex:1}}><p style={{fontSize:14,fontWeight:700,color:C.brand}}>イシューからはじめよ</p><p style={{fontSize:12,color:C.sub}}>安宅和人</p></div><span style={{fontSize:12,color:C.accent,fontWeight:600}}>変更</span>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <Label>読書した日</Label>
          <div style={{ ...cardStyle, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{fontSize:14,fontWeight:500,color:C.brand}}>2026年2月23日（日）</span><span style={{color:C.muted}}>📅</span></div>
          <div style={{ display:"flex", gap:8, marginTop:8 }}>{["今日","昨日","一昨日"].map((d,i)=>(<span key={i} style={{ fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:20, background:i===1?C.brand:"#fff", color:i===1?"#fff":C.sub, border:i===1?"none":`1px solid ${C.border}` }}>{d}</span>))}</div>
        </div>
        <div style={{ marginBottom:20 }}>
          <Label>読んだ方法</Label>
          <div style={{ display:"flex", gap:8 }}>{[{n:"紙の本",icon:"📖",s:false},{n:"Kindle",icon:"📙",s:true},{n:"Kobo",icon:"📘"},{n:"その他",icon:"📗"}].map((a,i)=>(<div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, borderRadius:16, padding:10, border:a.s?`2px solid ${C.brand}`:`2px solid ${C.border}`, background:a.s?C.bg:"#fff" }}><span style={{fontSize:18}}>{a.icon}</span><span style={{fontSize:10,color:C.sub,fontWeight:500}}>{a.n}</span></div>))}</div>
        </div>
        <div style={{ marginBottom:20 }}>
          <Label>読書時間</Label>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ ...cardStyle, flex:1, padding:16, textAlign:"center" }}><p style={{fontSize:10,color:C.muted}}>時間</p><p style={{fontSize:24,fontWeight:900,color:C.brand}}>0</p></div>
            <span style={{ color:C.muted, fontSize:18, fontWeight:700 }}>:</span>
            <div style={{ ...cardStyle, flex:1, padding:16, textAlign:"center" }}><p style={{fontSize:10,color:C.muted}}>分</p><p style={{fontSize:24,fontWeight:900,color:C.brand}}>35</p></div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:8 }}>{["15分","30分","45分","1時間"].map((d,i)=>(<span key={i} style={{ flex:1, fontSize:12, fontWeight:600, padding:"6px 0", borderRadius:20, textAlign:"center", background:i===1?C.brand:"#fff", color:i===1?"#fff":C.sub, border:i===1?"none":`1px solid ${C.border}` }}>{d}</span>))}</div>
        </div>
        <div style={{ marginBottom:20 }}>
          <Label>読んだページ（任意）</Label>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ ...cardStyle, flex:1, padding:12, textAlign:"center" }}><p style={{fontSize:10,color:C.muted}}>開始</p><p style={{fontSize:18,fontWeight:900,color:C.brand}}>166</p></div>
            <span style={{color:C.muted}}>→</span>
            <div style={{ ...cardStyle, flex:1, padding:12, textAlign:"center" }}><p style={{fontSize:10,color:C.muted}}>終了</p><p style={{fontSize:18,fontWeight:900,color:C.brand}}>180</p></div>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <Label>メモ（任意）</Label>
          <div style={{ borderRadius:16, border:`2px dashed ${C.border}`, background:"#fff", padding:16, minHeight:60 }}><p style={{fontSize:14,color:C.muted}}>気づいたことを書き留めよう...</p></div>
        </div>
        <div style={{ marginBottom:24 }}><Btn>記録を保存する</Btn></div>
      </div>
    </div>
  );
}

function Stats() {
  const [ti, setTi] = useState(0);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 8px" }}><p style={{ fontSize:20, fontWeight:900, color:C.brand }}>統計</p></div>
      <div style={{ display:"flex", margin:"0 20px", borderBottom:`2px solid ${C.border}`, marginBottom:16 }}>
        {["今週","今月","累計"].map((t,i)=>(<button key={i} onClick={()=>setTi(i)} style={{ flex:1, textAlign:"center", padding:"10px 0", fontSize:14, fontWeight:600, border:"none", background:"none", cursor:"pointer", color:i===ti?C.brand:C.muted, borderBottom:i===ti?`3px solid ${C.accent}`:"3px solid transparent" }}>{t}</button>))}
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, margin:"0 20px" }}>
          {[{l:"読書時間",v:"5h 12m",icon:"⏱",bg:"#E3F2FD"},{l:"読了冊数",v:"1 冊",icon:"📚",bg:"#E8F5E9"},{l:"ストリーク",v:"13 日 🔥",icon:"",bg:"#FFF3E0"},{l:"ページ数",v:"156 p",icon:"📄",bg:"#F3E5F5"}].map((s,i)=>(
            <div key={i} style={{ ...cardStyle, padding:16 }}>
              <div style={{ width:32, height:32, background:s.bg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}><span style={{fontSize:14}}>{s.icon}</span></div>
              <p style={{ fontSize:24, fontWeight:900, color:C.brand }}>{s.v}</p>
              <p style={{ fontSize:11, color:C.muted, fontWeight:500, marginTop:4 }}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{ margin:"16px 20px 0" }}>
          <Label>読書方法の内訳</Label>
          <div style={{ ...cardStyle, padding:16 }}>
            <div style={{ display:"flex", gap:12, marginBottom:12 }}>
              {[{l:"アプリ内",v:"2h 30m",c:C.brand},{l:"Kindle",v:"1h 52m",c:C.accent},{l:"Kobo",v:"0h 50m",c:"#42A5F5"}].map((s,i)=>(<div key={i} style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:10,height:10,borderRadius:5,background:s.c}}/><span style={{fontSize:11,color:C.sub,fontWeight:500}}>{s.l}</span></div><p style={{fontSize:14,fontWeight:700,color:C.brand,marginLeft:16}}>{s.v}</p></div>))}
            </div>
            <div style={{ width:"100%", height:12, borderRadius:6, display:"flex", overflow:"hidden" }}>
              <div style={{ background:C.brand, height:"100%", width:"48%", borderRadius:"6px 0 0 6px" }}/><div style={{ background:C.accent, height:"100%", width:"36%" }}/><div style={{ background:"#42A5F5", height:"100%", width:"16%", borderRadius:"0 6px 6px 0" }}/>
            </div>
          </div>
        </div>
        <div style={{ margin:"16px 20px 0" }}>
          <Label>日別読書時間</Label>
          <div style={{ ...cardStyle, padding:16 }}>
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:128 }}>
              {[40,65,30,80,55,0,0].map((h,i)=>(
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%" }}>
                  <div style={{ width:"100%", borderRadius:"6px 6px 0 0", background: i<5?`linear-gradient(to top, ${C.brand}, #4A4E69)`:C.bg, height:`${h||5}%`, minHeight:4 }}/>
                  <span style={{ fontSize:10, color:C.muted, marginTop:6, fontWeight:500 }}>{["月","火","水","木","金","土","日"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ margin:"16px 20px 16px" }}>
          <Label>2月の読書記録</Label>
          <div style={{ ...cardStyle, padding:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
              {Array.from({length:28},(_,i)=>{
                const c = i<5?C.brand:i<10?"#4A4E69":i<13?C.muted:i<24?C.border:"#F5F5F5";
                return <div key={i} style={{ aspectRatio:"1", borderRadius:4, background:c, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:7, fontWeight:600, color: i<13?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.12)" }}>{i+1}</span></div>;
              })}
            </div>
          </div>
        </div>
      </div>
      <Nav active={2}/>
    </div>
  );
}

function Profile() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 8px" }}><p style={{ fontSize:20, fontWeight:900, color:C.brand }}>設定</p></div>
      <div style={{ flex:1, padding:"8px 20px", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
          <div style={{ width:64, height:64, borderRadius:32, background:`linear-gradient(135deg, ${C.accent}, #FF8A00)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:20, fontWeight:900, boxShadow:`0 4px 12px rgba(245,166,35,0.3)` }}>田</div>
          <div style={{flex:1}}><p style={{fontSize:18,fontWeight:900,color:C.brand}}>田中太郎</p><p style={{fontSize:14,color:C.sub}}>tanaka@example.com</p></div>
          <span style={{ fontSize:12, fontWeight:600, color:C.accent, background:C.accentBg, padding:"6px 12px", borderRadius:12 }}>編集</span>
        </div>
        <div style={{ ...cardStyle, padding:16, marginBottom:16 }}>
          <Label>読書目標</Label>
          <div style={{ display:"flex", gap:12 }}>
            {[{v:"5",l:"日 / 週"},{v:"2",l:"冊 / 月"}].map((g,i)=>(<div key={i} style={{ flex:1, background:C.bg, borderRadius:16, padding:12, textAlign:"center" }}><p style={{fontSize:24,fontWeight:900,color:C.brand}}>{g.v}</p><p style={{fontSize:10,color:C.muted,fontWeight:500}}>{g.l}</p></div>))}
          </div>
        </div>
        <div style={{ ...cardStyle, marginBottom:16 }}>
          <div style={{ padding:"16px 16px 8px" }}><Label>通知設定</Label></div>
          {[{l:"リマインド通知",s:"毎日 21:00",on:true},{l:"ストリーク危険通知",s:"途切れそうな日の 22:00",on:true},{l:"週間レポート",s:"毎週月曜の朝",on:false}].map((n,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderTop:`1px solid ${C.bg}` }}>
              <div><p style={{fontSize:14,fontWeight:600,color:C.brand}}>{n.l}</p><p style={{fontSize:11,color:C.muted,marginTop:2}}>{n.s}</p></div>
              <div style={{ width:48, height:28, borderRadius:14, background:n.on?C.green:C.border, display:"flex", alignItems:"center", padding:2 }}>
                <div style={{ width:24, height:24, borderRadius:12, background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.1)", transform:n.on?"translateX(20px)":"translateX(0)", transition:"all 0.2s" }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...cardStyle, padding:16, marginBottom:16 }}>
          <Label>ストリークフリーズ</Label>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}><p style={{fontSize:14,fontWeight:600,color:C.brand}}>今月の残り</p><p style={{fontSize:18,fontWeight:900,color:C.accent}}>2 / 2 回</p></div>
          <p style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>月 2 回まで使用可能。事前または当日 23:59 までに発動できます。</p>
        </div>
        <div style={{ ...cardStyle, marginBottom:16 }}>
          <div style={{ padding:"16px 16px 8px" }}><Label>アプリ設定</Label></div>
          {[{l:"タイムゾーン",v:"Asia/Tokyo"},{l:"テーマ",v:"システム設定"},{l:"言語",v:"日本語"}].map((s,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderTop:`1px solid ${C.bg}` }}>
              <p style={{fontSize:14,fontWeight:600,color:C.brand}}>{s.l}</p><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14,color:C.sub}}>{s.v}</span><span style={{color:C.muted}}>›</span></div>
            </div>
          ))}
        </div>
        <div style={{ ...cardStyle, marginBottom:16 }}>
          {[{l:"ヘルプ・フィードバック"},{l:"利用規約"},{l:"プライバシーポリシー"},{l:"ログアウト",c:C.accent},{l:"アカウント削除",c:"#E53935"}].map((s,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderTop:i>0?`1px solid ${C.bg}`:"none" }}>
              <p style={{fontSize:14,fontWeight:600,color:s.c||C.brand}}>{s.l}</p><span style={{color:C.muted}}>›</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:11, color:C.muted, textAlign:"center", marginBottom:24 }}>BookLoop v1.0.0 (MVP)</p>
      </div>
      <Nav active={3}/>
    </div>
  );
}

const ALL = [Splash,Login,Onboarding,Home,Bookshelf,BookSearch,BookDetail,SessionStart,Session,ExternalSession,SessionComplete,ManualLog,Stats,Profile];
const descs = [
  "ブランドロゴとタグラインを表示。認証状態を確認後、ホームまたはログインへ遷移。",
  "Google / Apple のソーシャルログインとメール認証を提供。新規登録・ログインをタブで切替。",
  "3ステップ: コンセプト紹介 → 目標設定（週日数・月冊数）→ 最初の1冊追加。",
  "ストリーク・読書中の本・クイックスタートを集約。「あとから記録」ボタンも常時表示。",
  "ステータス別タブで書籍を管理。グリッド表示、検索・バーコードスキャン・追加に対応。",
  "タイトル / 著者名 / ISBN / バーコードで書籍検索。検索結果からワンタップで本棚に追加。",
  "書影・進捗バー・統計・メモを集約。「続きを読む」「あとから記録」の2つの導線。",
  "「このアプリで読む」or「外部アプリで読む」を選択。外部の場合は Kindle / Kobo 等を指定。",
  "ダークテーマのタイマー画面。一時停止・メモ入力に対応。集中を妨げないミニマル設計。",
  "外部アプリ読書中の画面。Kindle等で読書中もタイマーが動作。通知バー表示のプレビュー付き。",
  "セッション終了後のページ範囲入力・メモ記録。記録方法（Kindle等）も表示。",
  "過去7日以内の読書を手動記録。日付・読書方法・時間・ページを入力。クイック選択UI付き。",
  "週間バーチャート・月間ヒートマップ・読書方法別の内訳で読書習慣を多角的に可視化。",
  "プロフィール編集・読書目標変更・通知設定・フリーズ管理・アカウント管理を集約。",
];

export default function App() {
  const [cur, setCur] = useState(3);
  const dark = cur===0||cur===8||cur===9;
  const Scr = ALL[cur];
  return (
    <div style={{ minHeight:"100vh", background:"#EDEAE3", padding:"32px 0" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:8 }}>
          <div style={{ width:32, height:32, background:C.brand, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{fontSize:14}}>📖</span></div>
          <h1 style={{ fontSize:24, fontWeight:900, color:C.brand, margin:0 }}>BookLoop</h1>
        </div>
        <p style={{ fontSize:14, color:C.sub, fontWeight:500 }}>MVP モックアップ v2.0 — 全{screens.length}画面</p>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:6, marginBottom:32, padding:"0 16px", maxWidth:720, margin:"0 auto 32px" }}>
        {screens.map((s,i)=>(
          <button key={i} onClick={()=>setCur(i)} style={{ padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:600, border:i===cur?"none":`1px solid ${C.border}`, background:i===cur?C.brand:"#fff", color:i===cur?"#fff":C.sub, cursor:"pointer", transition:"all 0.2s" }}>{s}</button>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"center" }}>
        <Phone title={screens[cur]} dark={dark}><Scr/></Phone>
      </div>
      <div style={{ maxWidth:420, margin:"24px auto 0", padding:"0 16px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:700, color:C.accent, background:C.accentBg, padding:"2px 8px", borderRadius:4 }}>{ids[cur]}</span>
            <p style={{ fontSize:14, fontWeight:700, color:C.brand, margin:0 }}>{screens[cur]}</p>
          </div>
          <p style={{ fontSize:14, color:C.sub, lineHeight:1.6, margin:0 }}>{descs[cur]}</p>
        </div>
      </div>
    </div>
  );
}
