"use client";
/**
 * 홈 맨 위의 가입 혜택 배너(2026-10-11 파운더: 가입하면 포켓몬 카드 박스를 준다, 움직이는 배너로).
 * 장면: 개봉 화면과 같은 봉인 상자가 열리고, 카드 석 장이 솟아 부채처럼 펼쳐진 뒤 빛이 한 번 훑는다.
 *       그 둘레로 유리구슬들이 떠올랐다가 장면과 함께 사라진다.
 *   - 카드 석 장과 구슬은 전부 우리가 그린 것이다. 남의 캐릭터 그림, 실제 카드 그림, 공 모양은 그리지 않는다.
 *     권리를 가진 그림 파일이 있으면 web/public/assets/hero/ 에 아래 이름으로 넣기만 하면 된다(코드를 고치지 않는다. 다음 빌드부터 나온다).
 *       card-1.webp, card-2.webp, card-3.webp: 왼쪽, 가운데, 오른쪽 카드 면(세로 카드 한 장이 꽉 찬 사진)
 *       orb.webp: 떠다니는 구슬 자리의 그림(배경이 투명한 둥근 그림 한 장)
 *     파일이 있는 자리는 그 그림이 나오고, 솟아오르는 움직임과 훑는 빛은 그대로 적용된다. 없는 자리는 우리 그림이 나온다.
 *   - 움직임은 transform 과 opacity 만 쓴다. 화면 밖으로 나가면 멈추고, 멈춤 단추가 있다.
 *   - 움직임 줄이기를 켠 사람에게는 펼쳐진 한 장면만 보여 준다.
 * Codex 와 주고받은 비평은 brand/hero 에 있다.
 */
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BOXES } from "@/lib/products";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore, WELCOME_FREE_OPENS } from "@/stores/walletStore";
import { OpeningBox } from "@/components/box/Opening";

const GIFT_BOX_SLUG = "vault-pokemon";
const HERO_ASSETS = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/assets/hero/";
const CARD_FILES = ["card-1.webp", "card-2.webp", "card-3.webp"];
const ORB_FILE = "orb.webp";
/** 빌드할 때 그 폴더에 실제로 있던 파일 이름들(next.config.mjs) */
const HERO_FILES = (process.env.NEXT_PUBLIC_HERO_FILES ?? "").split(",").filter(Boolean);
type Phase = "closed" | "anticipation" | "open" | "sweep" | "fade";
/** 한 바퀴의 시간표(ms). 닫힘 → 웅크림 → 열림과 펼침 → 빛이 훑음(머묾) → 장면이 사라짐 → 처음으로 */
const STEPS: [Phase, number][] = [["closed", 320], ["anticipation", 190], ["open", 820], ["sweep", 3700], ["fade", 460]];

export function HeroBanner() {
  const t = useTranslations("v");
  const { boxTitle } = useProductText();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openAuth = useAuthStore((s) => s.openAuthModal);
  const box = BOXES.find((b) => b.slug === GIFT_BOX_SLUG);
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>("sweep"); // 서버가 그리는 첫 장면과 움직임 줄이기: 펼쳐진 한 장면
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
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
  const running = !reduced && !paused && visible;
  useEffect(() => {
    if (!running) return;
    let step = STEPS.findIndex(([p]) => p === phase); let timer = 0;
    const next = () => { step = (step + 1) % STEPS.length; setPhase(STEPS[step][0]); timer = window.setTimeout(next, STEPS[step][1]); };
    timer = window.setTimeout(next, phase === "sweep" ? 2400 : STEPS[Math.max(0, step)][1]);
    return () => window.clearTimeout(timer);
    // 멈췄다 다시 켤 때는 지금 장면에서 이어 간다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  if (!box) return null;
  const signedIn = ready && !!user;
  const freeLeft = useWalletStore((s) => s.freeOpens?.[GIFT_BOX_SLUG] ?? 0);
  const hasFree = signedIn && freeLeft > 0;
  const shown = reduced ? "sweep" : phase;
  const photos = CARD_FILES.map((name) => (HERO_FILES.includes(name) ? HERO_ASSETS + name : null));
  const orbImage = HERO_FILES.includes(ORB_FILE) ? HERO_ASSETS + ORB_FILE : null;
  return (
    <section ref={root} className="v-hero" aria-labelledby="hero-title" data-phase={shown} data-still={reduced || paused ? "" : undefined}>
      <span className="v-hero-bg" aria-hidden><span className="v-hero-slab" /><span className="v-hero-light" /></span>
      <div className="v-hero-copy">
        <h2 id="hero-title" className="v-hero-title">{boxTitle(box)}</h2>
        <p className="v-hero-desc">{hasFree ? t("hero.descFree", { n: freeLeft }) : signedIn ? t("hero.descIn") : t("hero.desc", { n: WELCOME_FREE_OPENS })}</p>
      </div>
      <div className="v-hero-stage" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => orbImage
          ? <span key={i} className="v-hero-orb v-hero-orb--image" data-i={i}><img src={orbImage} alt="" decoding="async" /></span>
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
      {!reduced && (
        <button type="button" className="v-hero-pause" onClick={() => setPaused((p) => !p)} aria-label={t(paused ? "hero.play" : "hero.pause")}>
          {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
        </button>
      )}
    </section>
  );
}
