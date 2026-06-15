import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

const concepts = ["利率", "通胀", "美元", "财政", "产业", "企业盈利", "地缘风险", "市场情绪"];
const layers = ["货币层", "央行层", "财政层", "产业层", "企业层", "地缘层", "社会层", "市场层"];
const questions = ["我该问什么？", "利率影响谁？", "通胀为什么重要？", "美股该看哪些变量？", "AI 需要什么上下文？"];

const colors = {
  bg: "#060D14",
  bg2: "#0A1723",
  panel: "rgba(8, 17, 25, 0.82)",
  panel2: "rgba(13, 25, 36, 0.88)",
  panel3: "rgba(18, 32, 44, 0.72)",
  text: "#F2F6FA",
  muted: "#8D9AAA",
  line: "rgba(93, 118, 142, 0.24)",
  lineStrong: "rgba(126, 154, 181, 0.38)",
  blue: "#3F97FF",
  blueSoft: "#173A64",
  gold: "#F4B33E",
  red: "#FF5A62",
  green: "#16D89A",
  slate: "#53606C"
};

const serifFont =
  '"Iowan Old Style", "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif';
const sansFont = '"Inter", "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const s = (seconds: number, fps: number) => seconds * fps;

const fade = (frame: number, fps: number, start: number, end: number) =>
  interpolate(frame, [s(start, fps), s(end, fps)], [0, 1], { ...clamp, easing: ease });

const fadeOut = (frame: number, fps: number, start: number, end: number) =>
  interpolate(frame, [s(start, fps), s(end, fps)], [1, 0], { ...clamp, easing: ease });

export const OpeningTransition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const finalReveal = fade(frame, fps, 87, 96);

  return (
    <AbsoluteFill style={{ background: colors.bg, fontFamily: serifFont, color: colors.text, overflow: "hidden" }}>
      <AnimatedBackground />
      <GlobalChrome />
      <Sequence from={0} durationInFrames={s(30, fps)}>
        <IdentityScene />
      </Sequence>
      <Sequence from={s(12, fps)} durationInFrames={s(38, fps)}>
        <MarketVariablesScene />
      </Sequence>
      <Sequence from={s(30, fps)} durationInFrames={s(36, fps)}>
        <BeginnerConfusionScene />
      </Sequence>
      <Sequence from={s(47, fps)} durationInFrames={s(43, fps)}>
        <LayerFrameworkScene />
      </Sequence>
      <Sequence from={s(78, fps)} durationInFrames={s(24, fps)}>
        <PromptBridgeScene />
      </Sequence>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: finalReveal,
          background: `linear-gradient(90deg, transparent 0%, rgba(63,151,255,${0.14 * finalReveal}) 46%, rgba(255,255,255,${0.1 * finalReveal}) 50%, rgba(63,151,255,${0.12 * finalReveal}) 54%, transparent 100%)`,
          transform: `translateX(${interpolate(finalReveal, [0, 1], [-140, 140])}px)`,
          pointerEvents: "none"
        }}
      />
    </AbsoluteFill>
  );
};

const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drift = frame * 0.16;
  const gridOpacity = interpolate(frame, [0, s(8, fps), s(96, fps)], [0.08, 0.14, 0.08], clamp);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 8% 9%, rgba(63,151,255,0.18), transparent 24%), radial-gradient(circle at 78% 18%, rgba(244,179,62,0.10), transparent 30%), linear-gradient(180deg, #07111B 0%, #08121B 45%, #050A10 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(10,23,35,0.88) 0%, rgba(10,23,35,0.42) 42%, rgba(6,13,20,0.85) 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -120,
          opacity: gridOpacity,
          backgroundImage:
            "linear-gradient(rgba(126,154,181,0.17) 1px, transparent 1px), linear-gradient(90deg, rgba(126,154,181,0.17) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          transform: `translate3d(${-drift % 64}px, ${(-drift * 0.45) % 64}px, 0)`
        }}
      />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 180px rgba(0,0,0,0.62)" }} />
    </>
  );
};

const GlobalChrome = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = fade(frame, fps, 0.2, 1.4);
  const navItems = ["总览", "图谱结构", "事件流", "数据源", "Skill Pack"];

  return (
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 74, borderBottom: `1px solid ${colors.line}`, background: "rgba(6, 13, 20, 0.68)", opacity, fontFamily: sansFont }}>
      <div style={{ height: "100%", display: "flex", alignItems: "center", padding: "0 42px", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#0D151E", border: `1px solid ${colors.lineStrong}`, display: "grid", placeItems: "center" }}>
            <FinGraphGlyph compact />
          </div>
          <div style={{ fontFamily: serifFont, fontSize: 24, fontWeight: 800 }}>FinGraph</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: 34 }}>
          {navItems.map((item, index) => (
            <div
              key={item}
              style={{
                height: 42,
                padding: "0 18px",
                display: "grid",
                placeItems: "center",
                borderRadius: 10,
                color: index === 0 ? colors.blue : colors.muted,
                background: index === 0 ? "rgba(63,151,255,0.16)" : "transparent",
                fontWeight: 700,
                fontSize: 15
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <StatusPill label="Supabase" value="live" color={colors.green} />
          <StatusPill label="NY" value="12:00" color={colors.blue} />
        </div>
      </div>
    </div>
  );
};

const IdentityScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 80, stiffness: 90 } });
  const titleIn = fade(frame, fps, 1.4, 2.6);
  const subtitleIn = fade(frame, fps, 6, 8.2);
  const exit = fadeOut(frame, fps, 24, 30);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <div style={{ position: "absolute", left: 118, top: 126, display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 18,
            background: "linear-gradient(180deg, rgba(17,30,43,0.98), rgba(10,18,27,0.98))",
            border: `1px solid ${colors.lineStrong}`,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 18px 60px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)",
            transform: `scale(${0.82 + logo * 0.18})`
          }}
        >
          <FinGraphGlyph />
        </div>
        <div>
          <div style={{ fontFamily: sansFont, fontSize: 18, color: colors.muted, opacity: titleIn }}>Personal Macro Intelligence System</div>
          <div style={{ fontSize: 64, fontWeight: 800, opacity: titleIn, textShadow: "0 20px 70px rgba(63,151,255,0.14)" }}>FinGraph</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 342,
          width: 980,
          fontSize: 50,
          lineHeight: 1.28,
          opacity: subtitleIn,
          transform: `translateY(${interpolate(subtitleIn, [0, 1], [28, 0])}px)`
        }}
      >
        围绕美股市场，把分散信息整理成可以交给 AI 的分析框架。
      </div>
      <MarketTicker opacity={fade(frame, fps, 13, 16)} />
    </AbsoluteFill>
  );
};

const FinGraphGlyph = ({ compact = false }: { compact?: boolean }) => (
  <svg width={compact ? 25 : 45} height={compact ? 25 : 45} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="fg-blue-remotion" x1="10" x2="38" y1="12" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#83BEFF" />
        <stop offset="1" stopColor="#2F72FF" />
      </linearGradient>
      <linearGradient id="fg-gold-remotion" x1="12" x2="36" y1="11" y2="35" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD76D" />
        <stop offset="1" stopColor="#E79A28" />
      </linearGradient>
    </defs>
    <path d="M12 16.6 20.5 12l7.4 4 8.1-4.4" fill="none" stroke="url(#fg-blue-remotion)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.6" />
    <path d="M12 24 20.5 19.4l7.4 4 8.1-4.4" fill="none" stroke="url(#fg-gold-remotion)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.6" />
    <path d="M12 31.4 20.5 26.8l7.4 4 8.1-4.4" fill="none" stroke="url(#fg-blue-remotion)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.6" />
    <circle cx="20.5" cy="12" r="2" fill="#9CC8FF" />
    <circle cx="27.9" cy="23.4" r="2" fill="#FFD56B" />
    <circle cx="36" cy="26.4" r="2" fill="#5C91FF" />
  </svg>
);

const MarketTicker = ({ opacity }: { opacity: number }) => {
  const items = [
    ["SPY", "+0.54%", colors.green],
    ["QQQ", "+0.72%", colors.green],
    ["TLT", "-0.18%", colors.red],
    ["CPI", "3.4%", colors.gold],
    ["10Y", "4.48%", colors.blue]
  ];
  return (
    <div style={{ position: "absolute", left: 118, right: 118, bottom: 246, display: "flex", gap: 14, opacity }}>
      {items.map(([name, value, color]) => (
        <div key={name} style={{ flex: 1, border: `1px solid ${colors.line}`, background: "rgba(8,17,25,0.72)", borderRadius: 14, padding: "20px 22px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
          <div style={{ fontFamily: sansFont, color: colors.muted, fontSize: 18 }}>{name}</div>
          <div style={{ marginTop: 9, color, fontSize: 34, fontWeight: 800 }}>{value}</div>
        </div>
      ))}
    </div>
  );
};

const MarketVariablesScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = Math.min(fade(frame, fps, 13, 16), fadeOut(frame, fps, 48, 50));
  const center = { x: 960, y: 490 };

  return (
    <AbsoluteFill style={{ opacity }}>
      <SectionTitle top={120} eyebrow="Not random news" title="这些变量最终都在影响美股定价" />
      <div style={{ position: "absolute", left: center.x - 92, top: center.y - 92, width: 184, height: 184, borderRadius: 92, background: colors.panel2, border: `2px solid rgba(255,255,255,0.28)`, display: "grid", placeItems: "center", boxShadow: "0 0 90px rgba(79,143,247,0.28)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, fontWeight: 900 }}>美股</div>
          <div style={{ marginTop: 6, fontFamily: sansFont, color: colors.muted, fontSize: 20 }}>pricing core</div>
        </div>
      </div>
      {concepts.map((concept, index) => {
        const angle = (-110 + index * 44) * (Math.PI / 180);
        const radius = 365;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        const itemIn = fade(frame, fps, 16 + index * 0.65, 17.4 + index * 0.65);
        return (
          <div key={concept}>
            <Line x1={center.x} y1={center.y} x2={x} y2={y} opacity={itemIn * 0.8} color={index % 3 === 0 ? colors.gold : index % 3 === 1 ? colors.blue : colors.green} />
            <div
              style={{
                position: "absolute",
                left: x - 82,
                top: y - 36,
                width: 164,
                height: 72,
                borderRadius: 18,
                border: `1px solid ${colors.line}`,
                background: colors.panel2,
                display: "grid",
                placeItems: "center",
                fontSize: 26,
                fontWeight: 700,
                opacity: itemIn,
                transform: `scale(${0.86 + itemIn * 0.14})`
              }}
            >
              {concept}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const BeginnerConfusionScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = Math.min(fade(frame, fps, 30, 33), fadeOut(frame, fps, 62, 66));

  return (
    <AbsoluteFill style={{ opacity }}>
      <SectionTitle top={118} eyebrow="The real pain point" title="小白不是只缺答案，而是缺提问框架" />
      <div style={{ position: "absolute", left: 142, top: 320, width: 660, height: 430, borderRadius: 30, background: colors.panel, border: `1px solid ${colors.line}`, padding: 36 }}>
        <div style={{ fontSize: 34, fontWeight: 800 }}>AI 能回答很多问题</div>
        <div style={{ marginTop: 18, fontSize: 28, lineHeight: 1.55, color: colors.muted }}>
          但如果用户不知道该补充什么背景、不知道变量之间的关系，提问本身就会变得很模糊。
        </div>
        <div style={{ marginTop: 34, borderRadius: 18, background: "rgba(240,99,99,0.12)", border: "1px solid rgba(240,99,99,0.26)", padding: 22, color: "#FFD2D2", fontSize: 26 }}>
          问题不是“AI 不会答”，而是“上下文没有被组织好”。
        </div>
      </div>
      {questions.map((question, index) => {
        const inValue = fade(frame, fps, 37 + index * 1.3, 38.4 + index * 1.3);
        return (
          <div
            key={question}
            style={{
              position: "absolute",
              right: 168 + (index % 2) * 84,
              top: 302 + index * 82,
              width: 520,
              padding: "22px 28px",
              borderRadius: 22,
              border: `1px solid ${colors.line}`,
              background: "rgba(12, 24, 38, 0.88)",
              fontSize: 30,
              opacity: inValue,
              transform: `translateX(${interpolate(inValue, [0, 1], [80, 0])}px)`
            }}
          >
            {question}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const LayerFrameworkScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = Math.min(fade(frame, fps, 47, 50), fadeOut(frame, fps, 88, 91));

  return (
    <AbsoluteFill style={{ opacity }}>
      <SectionTitle top={96} eyebrow="FinGraph method" title="用层级拓扑，把问题拆成可分析的路径" />
      <div style={{ position: "absolute", left: 126, right: 126, top: 246, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
        {layers.map((layer, index) => {
          const itemIn = fade(frame, fps, 50 + index * 0.75, 51.2 + index * 0.75);
          const color = [colors.blue, colors.gold, colors.green, colors.red][index % 4];
          return (
            <div
              key={layer}
              style={{
                height: 142,
                borderRadius: 24,
                border: `1px solid ${colors.line}`,
                background: `linear-gradient(135deg, ${color}22, rgba(11,22,34,0.86))`,
                padding: 26,
                opacity: itemIn,
                transform: `translateY(${interpolate(itemIn, [0, 1], [34, 0])}px)`
              }}
            >
              <div style={{ fontFamily: sansFont, color, fontSize: 18, fontWeight: 800 }}>Layer {index + 1}</div>
              <div style={{ marginTop: 14, fontSize: 34, fontWeight: 900 }}>{layer}</div>
            </div>
          );
        })}
      </div>
      <TopologyLine delay={59} />
      <div style={{ position: "absolute", left: 232, right: 232, bottom: 246, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        {["收集真实来源", "映射相关层级", "导出 AI 可读上下文"].map((item, index) => {
          const itemIn = fade(frame, fps, 66 + index * 2, 68 + index * 2);
          return (
            <div key={item} style={{ borderRadius: 22, border: `1px solid ${colors.line}`, background: colors.panel2, padding: 26, opacity: itemIn }}>
              <div style={{ color: [colors.green, colors.gold, colors.blue][index], fontFamily: sansFont, fontWeight: 800, fontSize: 20 }}>0{index + 1}</div>
              <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800 }}>{item}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const PromptBridgeScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = fade(frame, fps, 79, 82);
  const scale = interpolate(frame, [s(88, fps), s(96, fps), s(102, fps)], [0.88, 1, 1.08], clamp);
  const whiteFlash = interpolate(frame, [s(95.2, fps), s(97.2, fps), s(100, fps)], [0, 0.9, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", left: 256, right: 256, top: 176, bottom: 170, borderRadius: 38, border: `1px solid ${colors.line}`, background: colors.panel, boxShadow: "0 36px 140px rgba(0,0,0,0.4)", overflow: "hidden", transform: `scale(${scale})` }}>
        <div style={{ height: 84, borderBottom: `1px solid ${colors.line}`, display: "flex", alignItems: "center", gap: 14, padding: "0 28px", fontFamily: sansFont }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: colors.red }} />
          <span style={{ width: 16, height: 16, borderRadius: 8, background: colors.gold }} />
          <span style={{ width: 16, height: 16, borderRadius: 8, background: colors.green }} />
          <span style={{ marginLeft: 20, color: colors.muted, fontSize: 21 }}>fingraph.local / opening</span>
        </div>
        <div style={{ padding: 46 }}>
          <div style={{ fontSize: 50, fontWeight: 900 }}>美股金融分析图谱</div>
          <div style={{ marginTop: 16, color: colors.muted, fontSize: 26 }}>从网页信息流，进入可导出的 Skill Pack。</div>
          <div style={{ marginTop: 38, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 22 }}>
            <MockPanel title="今日一句话总结" color={colors.red} rows={3} />
            <MockPanel title="八个分析层健康度" color={colors.gold} rows={4} />
            <MockPanel title="TradingView 图表入口" color={colors.blue} rows={5} />
            <MockPanel title="导出 Skill Pack" color={colors.green} rows={3} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 54, textAlign: "center", color: colors.muted, fontFamily: sansFont, fontSize: 24 }}>
        接下来进入网页录屏展示
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${whiteFlash})` }} />
    </AbsoluteFill>
  );
};

const MockPanel = ({ title, color, rows }: { title: string; color: string; rows: number }) => (
  <div style={{ minHeight: 176, borderRadius: 22, border: `1px solid ${colors.line}`, background: "rgba(8,18,30,0.92)", padding: 22 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 10, height: 34, borderRadius: 8, background: color }} />
      <span style={{ fontSize: 26, fontWeight: 800 }}>{title}</span>
    </div>
    <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} style={{ height: 14, borderRadius: 999, width: `${88 - index * 13}%`, background: `linear-gradient(90deg, ${color}88, rgba(255,255,255,0.08))` }} />
      ))}
    </div>
  </div>
);

const SectionTitle = ({ top, eyebrow, title }: { top: number; eyebrow: string; title: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = fade(frame, fps, frame / fps - 0.01, frame / fps);

  return (
    <div style={{ position: "absolute", left: 126, top, opacity }}>
      <div style={{ fontFamily: sansFont, color: colors.blue, fontSize: 22, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2 }}>{eyebrow}</div>
      <div style={{ marginTop: 14, fontSize: 54, fontWeight: 900 }}>{title}</div>
    </div>
  );
};

const TopologyLine = ({ delay }: { delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = fade(frame, fps, delay, delay + 6);

  return (
    <div style={{ position: "absolute", left: 244, right: 244, top: 548, height: 92, opacity: progress }}>
      <svg width="100%" height="100%" viewBox="0 0 1432 92" preserveAspectRatio="none">
        <path d="M10 46 C 260 4, 410 88, 640 46 S 1040 4, 1422 46" fill="none" stroke="rgba(79,143,247,0.66)" strokeWidth="4" strokeDasharray="12 14" />
        <path d="M10 46 C 260 4, 410 88, 640 46 S 1040 4, 1422 46" fill="none" stroke="rgba(246,183,74,0.72)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${progress * 1520} 1520`} />
      </svg>
      <div style={{ position: "absolute", left: "43%", top: 28, padding: "10px 18px", borderRadius: 999, border: `1px solid ${colors.line}`, background: colors.panel2, fontSize: 22 }}>
        relation map
      </div>
    </div>
  );
};

const Line = ({ x1, y1, x2, y2, opacity, color }: { x1: number; y1: number; x2: number; y2: number; opacity: number; color: string }) => (
  <svg style={{ position: "absolute", inset: 0, opacity }}>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeDasharray="10 12" />
  </svg>
);
