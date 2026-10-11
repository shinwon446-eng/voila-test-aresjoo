"use client";
/**
 * 홈 맨 위의 가입 혜택 배너(2026-10-11 파운더: 가입하면 포켓몬 카드 박스를 준다, 움직이는 배너로).
 * 장면: 개봉 화면과 같은 봉인 상자가 열리고, 카드 석 장이 솟아 부채처럼 펼쳐진 뒤 빛이 한 번 훑는다.
 *       그 둘레로 공 다섯 개가 커지며 나타나 천천히 돌다가 장면과 함께 사라진다.
 *   - 공(2026-10-11 파운더가 준 배너 영상을 프레임 단위로 보고 맞췄다): 0.4초쯤에 커지며 돌아 들어오고, 머무는 동안 입체로 천천히 흔들리듯 돌고,
 *     0.25초에 작아지며 사라진다. 그림 파일이 아니라 구를 계산해 그린다(heroBall.ts). 그릴 수 없는 기기에서는 유리구슬이 나온다.
 *   - 카드 면: web/public/assets/hero/ 에 card-1.webp, card-2.webp, card-3.webp(왼쪽, 가운데, 오른쪽. 세로 카드 한 장이 꽉 찬 사진)를
 *     넣으면 다음 빌드부터 그 그림이 나온다(코드를 고치지 않는다). 지금은 파운더가 스캔한 카드가 들어 있다(출처는 그 폴더의 README.txt).
 *     없는 자리는 우리가 그린 카드가 나온다. 솟아오르는 움직임과 훑는 빛은 같다.
 *   - 움직임은 transform 과 opacity 만 쓴다. 화면 밖으로 나가면 멈춘다. 멈춤 단추는 뺐다(2026-10-11 파운더).
 *   - 움직임 줄이기를 켠 사람에게는 펼쳐진 한 장면만 보여 준다.
 * Codex 와 주고받은 비평은 brand/hero 에 있다.
 */
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BOXES } from "@/lib/products";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore, WELCOME_BOX_SLUG, WELCOME_FREE_OPENS } from "@/stores/walletStore";
import { OpeningBox } from "@/components/box/Opening";
import { ballMatrix, createBallPainter, type BallPainter } from "./heroBall";

const GIFT_BOX_SLUG = WELCOME_BOX_SLUG;
const HERO_ASSETS = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/assets/hero/";
const CARD_FILES = ["card-1.webp", "card-2.webp", "card-3.webp"];
/** 빌드할 때 그 폴더에 실제로 있던 파일 이름들(next.config.mjs) */
const HERO_FILES = (process.env.NEXT_PUBLIC_HERO_FILES ?? "").split(",").filter(Boolean);
/** 공 다섯 개의 방향(도)과 흔들림. 방향은 파운더가 준 배너의 공들을 따랐다(위아래가 뒤집힌 것, 비스듬한 것). delay 는 hero.css 의 나타나는 순서와 같다 */
const BALLS = [
  { yaw: -46, pitch: 4, roll: 172, delay: 200, seed: 0.0 },
  { yaw: -44, pitch: -14, roll: -34, delay: 40, seed: 1.7 },
  { yaw: -34, pitch: 24, roll: 24, delay: 120, seed: 3.1 },
  { yaw: -48, pitch: 2, roll: -14, delay: 160, seed: 4.4 },
  { yaw: -42, pitch: 10, roll: -150, delay: 80, seed: 5.6 },
];
type Phase = "closed" | "anticipation" | "open" | "sweep" | "fade";
/** 한 바퀴의 시간표(ms). 닫힘 → 웅크림 → 열림과 펼침 → 빛이 훑음(머묾) → 장면이 사라짐 → 처음으로
 *  카드와 공이 다 떠 있는 시간(머묾)은 30초다(2026-10-11 파운더) */
const STEPS: [Phase, number][] = [["closed", 320], ["anticipation", 190], ["open", 820], ["sweep", 30000], ["fade", 460]];

export function HeroBanner() {
  const t = useTranslations("v");
  const { boxTitle } = useProductText();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openAuth = useAuthStore((s) => s.openAuthModal);
  const box = BOXES.find((b) => b.slug === GIFT_BOX_SLUG);
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>("sweep"); // 서버가 그리는 첫 장면과 움직임 줄이기: 펼쳐진 한 장면
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const painter = useRef<BallPainter | null>(null);
  const [balls, setBalls] = useState(true); // 공을 그릴 수 없는 기기에서는 false: 유리구슬로 돌아간다
  const clock = useRef({ t: 0, popAt: -1e9 }); // 공의 시계(ms). 멈췄다 켜도 이어서 돈다
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply(); mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  // 화면 밖에서는 돌리지 않는다
  useEffect(() => {
    const el = root.current; if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const running = !reduced && visible;
  useEffect(() => {
    if (!running) return;
    let step = STEPS.findIndex(([p]) => p === phase); let timer = 0;
    const next = () => { step = (step + 1) % STEPS.length; setPhase(STEPS[step][0]); timer = window.setTimeout(next, STEPS[step][1]); };
    timer = window.setTimeout(next, phase === "sweep" ? 2400 : STEPS[Math.max(0, step)][1]);
    return () => window.clearTimeout(timer);
    // 멈췄다 다시 켤 때는 지금 장면에서 이어 간다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // 공: 그리는 장치를 한 번 만들고, 도는 동안에는 프레임마다, 멈춰 있을 때는 한 번 그린다
  useEffect(() => {
    painter.current = createBallPainter();
    if (!painter.current) setBalls(false);
    return () => { painter.current?.dispose(); painter.current = null; };
  }, []);
  useEffect(() => {
    const el = stage.current, hero = root.current, paint = painter.current;
    if (!balls || !el || !hero || !paint) return;
    const canvases = Array.from(el.querySelectorAll<HTMLCanvasElement>("canvas"));
    const targets = canvases.map((c) => c.getContext("2d"));
    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of canvases) { const size = Math.max(2, Math.round((c.parentElement?.offsetWidth ?? 0) * dpr)); if (c.width !== size) { c.width = size; c.height = size; } }
    };
    const wave = (period: number, seed: number) => Math.sin((clock.current.t / period) * Math.PI * 2 + seed);
    const draw = () => {
      if (!paint.alive()) { setBalls(false); return; }
      BALLS.forEach((b, i) => {
        const target = targets[i]; if (!target) return;
        // 나타날 때: 0.8초에 걸쳐 돌아 들어온다(끝으로 갈수록 느리게)
        const k = Math.min(1, Math.max(0, (clock.current.t - clock.current.popAt - b.delay) / 800));
        const spin = reduced ? 0 : (1 - k) ** 3;
        paint.paint(target, canvases[i].width, ballMatrix(
          b.yaw + 16 * wave(5200, b.seed) + 150 * spin,
          b.pitch + 7 * wave(4300, b.seed * 2.3 + 1),
          b.roll + 8 * wave(6100, b.seed * 1.4 + 2) + 50 * spin,
        ));
      });
    };
    // 크기를 바꾸면 캔버스가 비워지므로 바로 다시 그린다
    const fit = () => { measure(); draw(); };
    fit();
    window.addEventListener("resize", fit);
    let raf = 0, last = 0, before = hero.dataset.phase;
    const frame = (now: number) => {
      clock.current.t += last ? Math.min(64, now - last) : 0; last = now;
      const phase = hero.dataset.phase;
      if (phase === "open" && before !== "open") clock.current.popAt = clock.current.t;
      before = phase;
      if (phase !== "closed" && phase !== "anticipation") draw();
      raf = requestAnimationFrame(frame);
    };
    if (running) raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", fit); };
  }, [running, balls, reduced]);

  if (!box) return null;
  const signedIn = ready && !!user;
  const freeLeft = useWalletStore((s) => s.freeOpens?.[GIFT_BOX_SLUG] ?? 0);
  const hasFree = signedIn && freeLeft > 0;
  const shown = reduced ? "sweep" : phase;
  const photos = CARD_FILES.map((name) => (HERO_FILES.includes(name) ? HERO_ASSETS + name : null));
  return (
    <section ref={root} className="v-hero" aria-labelledby="hero-title" data-phase={shown} data-still={reduced ? "" : undefined}>
      <span className="v-hero-bg" aria-hidden><span className="v-hero-slab" /><span className="v-hero-light" /></span>
      <div className="v-hero-copy">
        <h2 id="hero-title" className="v-hero-title">{boxTitle(box)}</h2>
        <p className="v-hero-desc">{hasFree ? t("hero.descFree", { n: freeLeft }) : signedIn ? t("hero.descIn") : t("hero.desc", { n: WELCOME_FREE_OPENS })}</p>
      </div>
      <div ref={stage} className="v-hero-stage" aria-hidden>
        {BALLS.map((_, i) => balls
          ? <span key={i} className="v-hero-orb v-hero-orb--ball" data-i={i}><canvas /></span>
          : <span key={i} className="v-hero-orb" data-i={i}><i /></span>)}
        <div className="v-hero-scene" data-phase={shown === "open" || shown === "sweep" || shown === "fade" ? "impact" : shown === "anticipation" ? "anticipation" : "closed"}>
          <span className="v-hero-floor" />
          <OpeningBox />
          <span className="v-hero-cards">
            {[0, 1, 2].map((i) => (
              <span key={i} className="v-hcard" data-i={i}>
                {photos[i] ? (
                  <span className="v-hcard-face v-hcard-face--photo">
                    <img src={photos[i]!} alt="" decoding="async" /><i className="v-hcard-glare" />
                  </span>
                ) : (
                  <span className="v-hcard-face">
                    <i className="v-hcard-name" />
                    <i className="v-hcard-art">
                      {i === 0 ? (
                        // 결정
                        <svg viewBox="0 0 60 44" className="v-hcard-motif"><polygon className="m1" points="30,4 46,18 30,40 14,18" /><polygon className="m2" points="30,4 46,18 30,22" /><polygon className="m3" points="30,4 14,18 30,22" /><polygon className="m2" points="14,18 30,22 30,40" /></svg>
                      ) : i === 1 ? (
                        // 빛살
                        <svg viewBox="0 0 60 44" className="v-hcard-motif"><g className="m4"><line x1="30" y1="22" x2="30" y2="1" /><line x1="30" y1="22" x2="48" y2="6" /><line x1="30" y1="22" x2="57" y2="22" /><line x1="30" y1="22" x2="48" y2="38" /><line x1="30" y1="22" x2="30" y2="43" /><line x1="30" y1="22" x2="12" y2="38" /><line x1="30" y1="22" x2="3" y2="22" /><line x1="30" y1="22" x2="12" y2="6" /></g><polygon className="m1" points="30,5 34,18 47,22 34,26 30,39 26,26 13,22 26,18" /><circle className="m3" cx="30" cy="22" r="3" /></svg>
                      ) : (
                        // 별자리
                        <svg viewBox="0 0 60 44" className="v-hcard-motif"><polyline className="m4" points="8,34 20,20 31,26 42,10 53,16" /><circle className="m1" cx="8" cy="34" r="2.2" /><circle className="m1" cx="20" cy="20" r="3" /><circle className="m1" cx="31" cy="26" r="2" /><circle className="m1" cx="42" cy="10" r="3.4" /><circle className="m1" cx="53" cy="16" r="2" /><circle className="m3" cx="46" cy="33" r="1.4" /><circle className="m3" cx="14" cy="9" r="1.2" /></svg>
                      )}
                    </i>
                    <i className="v-hcard-text" />
                    <i className="v-hcard-no">{"00" + (i + 1) + "/003"}</i>
                    <i className="v-hcard-glare" />
                  </span>
                )}
              </span>
            ))}
          </span>
          {[0, 1, 2, 3, 4, 5].map((i) => <i key={i} className="v-hero-spark" data-i={i} />)}
        </div>
      </div>
      <div className="v-hero-cta">
        {signedIn
          ? <Link href={"/box/" + box.slug} className="v-btn">{t(hasFree ? "hero.ctaFree" : "hero.ctaIn")}</Link>
          : <button type="button" className="v-btn" onClick={() => openAuth("signup")}>{t("hero.cta")}</button>}
      </div>
    </section>
  );
}
