"use client";
/**
 * 업그레이드 시트(flow/MELT_SPEC.md U3, U5, U6). 결정 하나: 어느 배수에 걸지.
 * 보관 중인 상품 하나를 걸고 더 비싼 상품에 도전한다. 한 개 결과 화면, 여러 개 결과의 상품 상세, 보관함의 상품 상세가 이 부품을 연다.
 *   고르기 → 추첨 연출 → 결과
 * 고르기: 배수 단추마다 카탈로그의 실제 상품 하나가 목표다(lib/upgrade). 단추를 고르면 목표의 사진, 이름, 상품가, 실제 배수, 성공 확률이 보이고
 *   "실패하면 건 상품은 사라집니다"는 주 단추 바로 위에 처음부터 적혀 있다. 처음에는 아무 단추도 고르지 않았다.
 *   맞는 목표가 없는 단추는 누를 수 없고, 어느 단추가 왜 막혔는지 아래에 글로 적는다.
 * 추첨: 주 단추를 누르는 순간 결과가 정해지고 장부에 적힌다(lib/upgradeSettle). 연출은 그것을 있는 그대로 보여 준다.
 *   길이는 결과와 상관없이 같다(lib/upgrade 의 UPGRADE_DRAW_MS). 막대에 성공 구간을 확률만큼 그리고, 표시가 0 에서 실제로 나온 수의 자리까지
 *   같은 길이, 같은 움직임 곡선(일정한 비율, 느려지며 멈추지 않는다)으로 가서 그 자리에 멈춘다. 길이가 같으므로 나온 수가 클수록 표시가 빨리 움직인다.
 *   결과에 따라 길이, 곡선, 멈추는 자리를 바꾸지 않는다. 경계는 엄격한 미만이다: 나온 수가 성공 확률보다 작을 때만 성공이고, 그 문장과 두 수를 함께 적는다.
 *   움직임 줄이기 설정이면 연출 없이 결과부터.
 * 초점과 낭독(flow/agy-restore-2.txt): 결과로 넘어가면 초점을 결과 묶음으로 옮긴다(주 단추를 누르면 그 단추가 사라져 초점이 문서로 떨어지므로).
 *   결과 묶음은 단추 바로 앞에 있어 Tab 한 번이 주 단추다. 화면 읽기 도구에는 시트가 뜰 때부터 있는 상태 영역(role=status)이 결과 문장을 읽어 준다.
 *   추첨 중 Esc 는 닫기가 아니라 결과 바로 보기다(개봉 화면과 같다. 장부는 주 단추를 누른 순간 이미 끝났다).
 *   닫을 때는 돌아갈 보관 상품의 id 를 부른 쪽에 넘긴다(보관함과 여러 개 결과는 상세 시트를 먼저 닫고 이 시트를 열어, 누른 단추가 사라져 있다).
 * 걸기 전에 잠근 값: 고르는 화면의 링크 하나가 이번 추첨에 쓸 잠근 값(해시), 내 기기 값, 다음 회차를 보여 준다. 결과 검증의 같은 줄과 견줄 수 있다.
 * 탭 사이의 잠금(Web Locks)이 없는 브라우저에서는 걸지 않고 그 자리에 글로 알린다(lib/upgradeSettle 의 nolock).
 * 결과: 성공이면 목표 상품(주 단추 "USDT로 받기", 조용한 단추 "한 번 더 업그레이드", 링크 "보관함에 두기"와 "결과 검증").
 *   실패면 실패했고 건 상품이 사라졌다고 그대로 적는다(주 단추는 박스 보러 가기 하나, 링크 "결과 검증").
 *   장부에 적히지 않았으면 결과를 말하지 않는다: 실행하지 못했다(상품은 보관함에 있다), 또는 확인하지 못했다(성공도 실패도 아니다).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BOX_BY_SLUG, type ProductItem } from "@/lib/products";
import { NO_CHAIN_RECORD } from "@/lib/chainRecord";
import { settleTake } from "@/lib/openingSettle";
import { takeAmountOf } from "@/lib/takeBatch";
import { UPGRADE_DRAW_MS, chanceText, rollPercent, rollText, upgradeOptions, verifyUpgradeRecord, type UpgradeRecord, type UpgradeVerification } from "@/lib/upgrade";
import { canStake, settleUpgrade, type UpgradeOutcome } from "@/lib/upgradeSettle";
import { ledgerLockAvailable } from "@/lib/ledgerLock";
import { useFairStore } from "@/stores/fairStore";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Sheet } from "@/components/ui/Sheet";
import { Button, ButtonLink, Line, Row, Rows, TextLink } from "@/components/ui/kit";
import { TakeConfirm, useTakeLedger } from "@/components/flow/TakeSheet";
import { ChainRecordView } from "@/components/verify/ChainRecord";

type Step = "pick" | "draw" | "result";

const productAt = (boxSlug: string, itemId: string): ProductItem | undefined => BOX_BY_SLUG[boxSlug]?.items.find((p) => p.id === itemId);
const short = (hex: string) => (hex.length > 20 ? hex.slice(0, 10) + "…" + hex.slice(-8) : hex);

/** 추첨 막대: 왼쪽부터 확률만큼이 성공 구간이고, 표시는 나온 수의 자리에 있다. moving 이면 0 에서 그 자리까지 같은 길이, 같은 곡선으로 간다 */
function DrawBar({ record, moving }: { record: UpgradeRecord; moving?: boolean }) {
  const style = { "--zone": record.chanceUnits / 100 + "%", "--at": rollPercent(record.roll) + "%", "--dur": UPGRADE_DRAW_MS + "ms" } as CSSProperties;
  return (
    <div className="v-up-bar" data-moving={moving || undefined} style={style} aria-hidden>
      <span className="v-up-track"><span className="v-up-zone" /></span>
      <span className="v-up-mark" />
    </div>
  );
}

/** 화면 읽기 도구에만 읽히는 글(reviews.css 의 v-rv-sr 과 같은 모양. 이 시트 안에서만 쓴다) */
const SR_ONLY: CSSProperties = { position: "absolute", overflow: "hidden", width: 1, height: 1, margin: -1, padding: 0, border: 0, clipPath: "inset(50%)", whiteSpace: "nowrap" };

export function UpgradeSheet({ stakeId, onClose, onBack }: {
  /** 걸 상품의 보관 상품 id. null 이면 닫혀 있다 */
  stakeId: string | null;
  /** 닫는다. landing 은 초점을 돌려보낼 보관 상품의 id 다(성공해 받지 않은 목표 상품이면 그것, 아니면 지금 건 상품) */
  onClose: (landing?: string) => void;
  /** 박스 화면(개봉 결과)에서 열었으면 그 박스로 돌아가는 일. 실패 화면의 주 단추가 쓴다. 없으면 박스 목록으로 간다 */
  onBack?: () => void;
}) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName } = useProductText();
  const accountId = useAuthStore((s) => s.user?.id ?? null);
  const items = useInventoryStore((s) => s.items);
  const ledger = useTakeLedger();
  // 지금 거는 상품. "한 번 더 업그레이드"는 방금 받은 목표 상품을 이어서 건다
  const [current, setCurrent] = useState<string | null>(stakeId);
  const [chip, setChip] = useState<number | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<UpgradeOutcome | null>(null);
  const [verifying, setVerifying] = useState<UpgradeRecord | null>(null);
  // 걸기 전에 잠근 값을 보는 창. 이번 추첨에 쓸 값(잠근 값의 해시, 내 기기 값, 다음 회차)은 공정성 저장소에서 읽는다
  const [locked, setLocked] = useState(false);
  const fairHash = useFairStore((s) => s.serverSeedHash); const fairClient = useFairStore((s) => s.clientSeed); const fairNonce = useFairStore((s) => s.nonce);
  const fair = { serverSeedHash: fairHash, clientSeed: fairClient, nonce: fairNonce };
  // 값이 아직 없으면(처음 쓰는 기기) 만든다. 이 값이 이번 추첨에 그대로 쓰인다
  useEffect(() => { if (locked) void useFairStore.getState().ensureSeeds(); }, [locked]);
  // 탭 사이의 잠금이 있는 브라우저인가. 열 때 한 번 본다
  const [lockOk] = useState(() => ledgerLockAvailable());
  // 성공한 뒤 목표 상품을 USDT 로 받는 일: 확인창, 받은 금액, 받지 못했을 때의 한 줄
  const [asking, setAsking] = useState(false);
  const [taking, setTaking] = useState(false);
  const [took, setTook] = useState<number | null>(null);
  const [takeNote, setTakeNote] = useState<"failed" | "unknown" | null>(null);
  // 상태(busy)는 다음 그리기에야 바뀐다. 같은 순간에 두 번 눌려도 요청이 한 번만 나가게 동기 잠금을 둔다
  const lock = useRef(false);
  // 요청 세대: 시트를 다시 열었거나 계정이 바뀐 뒤에 돌아온 옛 응답을 이 화면에 적용하지 않는다
  const generation = useRef(0);
  const open = stakeId !== null;
  // 결과 묶음(단추 앞의 내용). 결과로 넘어가면 여기로 초점을 옮긴다
  const resultRef = useRef<HTMLDivElement>(null);

  const restart = (id: string | null) => {
    setCurrent(id); setChip(null); setStep("pick"); setBusy(false); setOutcome(null); setVerifying(null); setLocked(false);
    setAsking(false); setTaking(false); setTook(null); setTakeNote(null);
    lock.current = false; generation.current += 1;
  };
  // 열 때마다 처음 상태로. 계정이 바뀌어도 고른 것과 결과를 비운다
  useEffect(() => { restart(stakeId); }, [stakeId, accountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stake = items.find((item) => item.id === current) ?? null;
  const stakeProduct = stake ? productAt(stake.boxSlug, stake.itemId) : undefined;
  const options = useMemo(
    () => (stake ? upgradeOptions({ itemId: stake.itemId, valueUsdt: stake.valueUsdt, category: BOX_BY_SLUG[stake.boxSlug]?.category }) : []),
    [stake?.itemId, stake?.valueUsdt, stake?.boxSlug], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const selected = options.find((o) => o.chip === chip && o.target) ?? null;
  const closed = options.filter((o) => !o.target);
  const record = outcome && (outcome.status === "won" || outcome.status === "lost") ? outcome.record : null;
  const pct = (units: number) => t("upgrade.chanceValue", { pct: chanceText(units) });

  // 연출의 길이는 결과와 상관없이 같다
  useEffect(() => {
    if (step !== "draw") return;
    const timer = window.setTimeout(() => setStep("result"), UPGRADE_DRAW_MS);
    return () => window.clearTimeout(timer);
  }, [step]);
  // 추첨 중 Esc: 결과 바로 보기(닫기가 아니다). 시트는 추첨 중 잠겨 있어 그 Esc 를 버리므로, 시트의 듣기(document)보다 먼저 받는 창(window)의 잡는 단계에서 가로챈다.
  // 그 사이에 겹친 창은 없다(잠근 값 보기, 검증, 확인창은 추첨 중에 열리지 않는다)
  useEffect(() => {
    if (step !== "draw") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault(); event.stopImmediatePropagation();
      setStep("result");
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [step]);
  // 결과로 넘어가면 초점을 결과 묶음으로. 주 단추를 누르면 그 단추가 사라져 초점이 문서로 떨어지는 것을 막는다. 묶음 바로 뒤가 주 단추라 Tab 한 번이면 닿는다
  useEffect(() => {
    if (step !== "result") return;
    const frame = requestAnimationFrame(() => resultRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [step]);
  // 닫기: 초점을 돌려보낼 보관 상품을 함께 알린다
  const close = () => onClose(record?.won && took === null && items.some((item) => item.id === record.target.ownedId) ? record.target.ownedId : current ?? undefined);

  const run = async () => {
    if (lock.current || !stake || !selected?.target) return;
    lock.current = true; setBusy(true);
    const mine = generation.current; const requester = accountId;
    let out: UpgradeOutcome;
    // 답을 받지 못했으면 성공도 실패도 단정하지 않는다
    try { out = await settleUpgrade({ stakeOwnedId: stake.id, targetItemId: selected.target.item.id, chanceUnits: selected.chanceUnits }); }
    catch { out = { status: "unknown" }; }
    if (generation.current !== mine || (useAuthStore.getState().user?.id ?? null) !== requester) return;
    lock.current = false; setBusy(false); setOutcome(out);
    const drawn = out.status === "won" || out.status === "lost";
    setStep(drawn && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "draw" : "result");
  };

  // 성공해서 들어온 목표 상품(보관함 기록). 받기는 다른 받기와 같은 코드를 거친다(lib/openingSettle → lib/takeBatch)
  const won = record?.won ? items.find((item) => item.id === record.target.ownedId) ?? null : null;
  const take = async () => {
    if (!won || taking) return;
    setTaking(true); setTakeNote(null);
    const mine = generation.current;
    let out: Awaited<ReturnType<typeof settleTake>>;
    try { out = await settleTake(won.id); } catch { out = { status: "unknown" }; }
    if (generation.current !== mine) return;
    setTaking(false); setAsking(false);
    if (out.status === "settled") setTook(out.amountUsdt); else setTakeNote(out.status === "failed" ? "failed" : "unknown");
  };

  const targetCard = (product: ProductItem | undefined, fallback: string, valueUsdt: number) => (
    <div className="v-up-target">
      {product?.image.src && <span className="v-up-photo"><img src={product.image.src} alt="" /></span>}
      <span className="v-up-target-body">
        <span className="v-small">{t("upgrade.target")}</span>
        <span className="v-card-title">{product ? itemName(product) : fallback}</span>
        <span className="v-small v-num">{t("take.ref", { amount: fmt(valueUsdt) })}</span>
      </span>
    </div>
  );
  const drawn = record && (
    <>
      <DrawBar record={record} moving={step === "draw"} />
      {/* 눈금은 0 에서 100. 나온 수와 성공 확률을 같은 눈금으로 적고, 엄격한 미만이라는 것을 문장으로 적는다 */}
      <div className="v-up-scale v-small v-num" aria-hidden><span>0</span><span>100</span></div>
      <p className="v-small v-num">{step === "result" && <>{t("upgrade.rolledLine", { roll: rollText(record.roll) })}<br /></>}{t("upgrade.zone", { pct: chanceText(record.chanceUnits) })}</p>
    </>
  );
  const verifyLink = record && <TextLink onClick={() => setVerifying(record)}>{t("upgrade.verify")}</TextLink>;
  const title = step === "result" && record ? t(record.won ? "upgrade.wonTitle" : "upgrade.lostTitle") : t("upgrade.title");
  const desc = step === "pick" ? t("upgrade.desc") : step === "result" && record?.won ? t("upgrade.wonDesc") : undefined;
  // 화면 읽기 도구가 읽을 결과 문장. 성공과 실패는 제목과 한 줄, 그 밖은 그 자리의 한 줄과 같은 글이다
  const announce = step !== "result" || !outcome ? "" : record ? title + " " + t(record.won ? "upgrade.wonDesc" : "upgrade.lostDesc") : t(outcome.status === "failed" ? "upgrade.failed" : outcome.status === "nolock" ? "upgrade.noLock" : outcome.status === "blocked" ? "upgrade.blocked" : "upgrade.unknown");
  // 결과 묶음: 단추 바로 앞의 내용. 초점이 여기로 온다
  const result = (children: ReactNode) => <div ref={resultRef} tabIndex={-1} data-upgrade-result className="v-stack">{children}</div>;

  return (
    <>
      <Sheet open={open && !verifying && !asking && !locked} onClose={close} title={title} desc={desc} closeLabel={t("common.close")} locked={busy || taking || step === "draw"}>
        {/* 결과의 낭독: 시트가 뜰 때부터 있는 상태 영역에 결과 문장이 들어온다(뒤늦게 생긴 영역은 읽히지 않을 수 있다) */}
        <p role="status" aria-live="polite" aria-atomic="true" style={SR_ONLY} data-upgrade-announce>{announce}</p>
        {/* 거는 동안에는 장부가 먼저 바뀐다. 그 사이에 막힌 화면이 스치지 않게 처리 중에는 고르기 화면을 그대로 둔다 */}
        {/* 탭 사이의 잠금이 없는 브라우저: 걸지 않는다. 추첨도 하지 않는다 */}
        {step === "pick" && !lockOk && (
          <>
            <Line>{t("upgrade.noLock")}</Line>
            <Button onClick={close}>{t("common.close")}</Button>
          </>
        )}
        {step === "pick" && lockOk && (!stake || (!busy && !canStake(stake, ledger)) ? (
          <>
            {/* 다른 곳에서 먼저 받았거나 걸었거나, 확인 필요 상태다. 걸 수 없다 */}
            <Line>{t("upgrade.blocked")}</Line>
            <Button onClick={close}>{t("common.close")}</Button>
          </>
        ) : (
          <>
            <Rows>
              <Row label={t("upgrade.stake")}>{stakeProduct ? itemName(stakeProduct) : stake.itemId}</Row>
              <Row label={t("reveal.value")}>{fmt(stake.valueUsdt)}</Row>
            </Rows>
            <div className="v-stack v-stack--sm">
              <div role="group" aria-label={t("upgrade.chips")} className="v-chips v-up-chips">
                {options.map((o) => (
                  <button key={o.chip} type="button" className="v-chip" data-upgrade-chip={o.chip} aria-pressed={chip === o.chip} disabled={!o.target || busy} onClick={() => setChip(o.chip)}>{t("upgrade.chip", { n: o.chip })}</button>
                ))}
              </div>
              {/* 누를 수 없는 단추는 이유를 글로 적는다 */}
              {closed.length > 0 && closed.length < options.length && <p className="v-small">{t("upgrade.noTarget", { chips: closed.map((o) => t("upgrade.chip", { n: o.chip })).join(", ") })}</p>}
              {closed.length === options.length && <Line>{t("upgrade.noneAtAll")}</Line>}
            </div>
            {/* 단추를 고르기 전에도 같은 자리를 잡아 둔다(고르는 순간 화면이 덜컥거리지 않게) */}
            <div className="v-up-choice" aria-live="polite">
              {selected?.target && (
                <>
                  {targetCard(selected.target.item, selected.target.item.id, selected.target.item.value)}
                  <Rows>
                    <Row label={t("upgrade.times")}>{t("upgrade.chip", { n: selected.times })}</Row>
                    <Row label={t("upgrade.chance")}>{pct(selected.chanceUnits)}</Row>
                  </Rows>
                </>
              )}
            </div>
            <div className="v-take-foot">
              <p className="v-line">{t("upgrade.lose")}</p>
              <Button data-upgrade-go onClick={() => void run()} disabled={!selected} busy={busy} busyLabel={t("common.checking")}>{selected ? t("upgrade.go") : t("upgrade.pick")}</Button>
              {/* 걸기 전에 잠근 값을 본다(이 화면의 링크는 이것 하나) */}
              <div className="v-links"><TextLink onClick={() => { if (!busy) setLocked(true); }}>{t("upgrade.lockedLink")}</TextLink></div>
            </div>
          </>
        ))}

        {step === "draw" && record && (
          <>
            {targetCard(productAt(record.target.boxSlug, record.target.itemId), record.target.itemId, record.target.valueUsdt)}
            {drawn}
            <Line>{t("upgrade.drawing")}</Line>
            <div className="v-links"><TextLink onClick={() => setStep("result")}>{t("op.skip")}</TextLink></div>
          </>
        )}

        {step === "result" && record?.won && (() => {
          const product = productAt(record.target.boxSlug, record.target.itemId);
          // 목표 상품이 받을 수 있는 상태인지는 받는 일과 같은 기준으로 본다. 아니면 받기 단추를 주지 않는다
          const takeable = !!won && canStake(won, ledger);
          return (
            <>
              {result(<>
                {product?.image.src && <div className="v-sheet-photo v-up-won"><img src={product.image.src} alt="" /></div>}
                <div>
                  <p className="v-card-title">{product ? itemName(product) : record.target.itemId}</p>
                  <p className="v-small v-num">{t("take.ref", { amount: fmt(record.target.valueUsdt) })}</p>
                </div>
                {drawn}
              </>)}
              <div className="v-take-foot">
                {took !== null && <Line>{t("take.done", { amount: fmt(took) })}</Line>}
                {took === null && (takeNote === "unknown" || !takeable) && <Line fail>{t("take.unknown")}</Line>}
                {took === null && takeNote === "failed" && takeable && <Line fail>{t("take.failed")}</Line>}
                {took === null && takeable && takeNote !== "unknown" && won ? (
                  <>
                    <Button data-take-primary onClick={() => setAsking(true)}>{t("reveal.take", { amount: fmt(takeAmountOf(won)) })}</Button>
                    <Button quiet data-upgrade-again onClick={() => restart(won.id)}>{t("upgrade.again")}</Button>
                    <div className="v-links"><TextLink onClick={close}>{t("take.keep")}</TextLink>{verifyLink}</div>
                  </>
                ) : (
                  <>
                    <Button onClick={close}>{t("common.close")}</Button>
                    <div className="v-links">{verifyLink}</div>
                  </>
                )}
              </div>
            </>
          );
        })()}

        {step === "result" && record && !record.won && (() => {
          const product = productAt(record.stake.boxSlug, record.stake.itemId);
          return (
            <>
              {result(<>
                {/* 실패를 돌려 말하지 않는다. 낭독은 위의 상태 영역이 맡으므로 이 줄은 또 읽히지 않게 한다 */}
                <Line fail live={false}>{t("upgrade.lostDesc")}</Line>
                <Rows>
                  <Row label={t("upgrade.stake")}>{product ? itemName(product) : record.stake.itemId}</Row>
                  <Row label={t("reveal.value")}>{fmt(record.stake.valueUsdt)}</Row>
                </Rows>
                {drawn}
              </>)}
              {/* 박스 화면에서 열었으면 그 박스로 돌아간다. 보관함에서 열었으면 박스 목록으로 간다 */}
              {onBack ? <Button data-upgrade-back onClick={() => { close(); onBack(); }}>{t("op.backToBox")}</Button> : <ButtonLink href="/">{t("upgrade.toBoxes")}</ButtonLink>}
              <div className="v-links">{verifyLink}</div>
            </>
          );
        })()}

        {step === "result" && outcome?.status === "failed" && (
          <>
            {result(<Line fail live={false}>{t("upgrade.failed")}</Line>)}
            <Button data-upgrade-retry onClick={() => restart(current)}>{t("take.retry")}</Button>
            <div className="v-links"><TextLink onClick={close}>{t("common.close")}</TextLink></div>
          </>
        )}
        {step === "result" && outcome?.status === "nolock" && (
          <>
            {result(<Line live={false}>{t("upgrade.noLock")}</Line>)}
            <Button onClick={close}>{t("common.close")}</Button>
          </>
        )}
        {step === "result" && outcome?.status === "blocked" && (
          <>
            {result(<Line live={false}>{t("upgrade.blocked")}</Line>)}
            <Button onClick={close}>{t("common.close")}</Button>
          </>
        )}
        {/* 확인하지 못했다: 성공이라고도 실패라고도 하지 않는다. 다시 걸게 하지도 않는다 */}
        {step === "result" && outcome?.status === "unknown" && (
          <>
            {result(<Line fail live={false}>{t("upgrade.unknown")}</Line>)}
            <Button onClick={close}>{t("common.close")}</Button>
            <div className="v-links"><TextLink href="/inventory" onClick={close}>{t("nav.inventory")}</TextLink></div>
          </>
        )}
      </Sheet>

      {/* 목표 상품을 USDT 로 받기: 다른 받기와 같은 확인 한 번 */}
      <TakeConfirm open={open && asking && !!won} amountUsdt={won ? takeAmountOf(won) : 0} onCancel={() => setAsking(false)} onConfirm={() => void take()} busy={taking} />
      <UpgradeVerifySheet record={verifying} onClose={() => setVerifying(null)} />
      {/* 걸기 전에 잠근 값: 이번 추첨에 쓸 값들. 닫으면 고르던 화면으로 돌아간다(고른 단추는 그대로다) */}
      <Sheet open={open && locked} onClose={() => setLocked(false)} title={t("upgrade.verifyStep1")} desc={t("upgrade.lockedDesc")} closeLabel={t("common.close")}>
        <div className="v-card v-stack v-stack--sm" data-upgrade-locked>
          <div className="v-step"><span className="v-small">{t("verify.locked")}</span><p className="v-body v-up-hash">{fair.serverSeedHash || t("common.loading")}</p></div>
          <div className="v-step"><span className="v-small">{t("verify.client")}</span><p className="v-body v-up-hash">{fair.clientSeed || t("common.loading")}</p></div>
          <div className="v-step"><span className="v-small">{t("upgrade.nextRound")}</span><p className="v-body v-num">{fair.nonce.toLocaleString("en-US")}</p></div>
        </div>
        <p className="v-small">{t("verify.localNote")}</p>
      </Sheet>
    </>
  );
}

/**
 * 업그레이드 결과 검증. 개봉 결과 검증(components/flow/VerifySheet)과 같은 세 단계다:
 * 걸기 전에 잠근 값, 블록체인 기록(이 테스트 사이트에는 없다), 다시 계산한 결과.
 * 기록의 값만으로 해시, 번호, 확률, 결과를 이 브라우저에서 다시 계산해 기록과 견준다(lib/upgrade 의 verifyUpgradeRecord).
 */
export function UpgradeVerifySheet({ record, onClose }: { record: UpgradeRecord | null; onClose: () => void }) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const [out, setOut] = useState<UpgradeVerification | "failed" | null>(null);

  useEffect(() => {
    if (!record) return;
    let alive = true;
    setOut(null);
    verifyUpgradeRecord(record)
      .then((result) => { if (alive) setOut(result); })
      .catch(() => { if (alive) setOut("failed"); });
    return () => { alive = false; };
  }, [record]);

  const done = out && out !== "failed" ? out : null;
  const wait = t("common.checking");

  return (
    <Sheet open={!!record} onClose={onClose} title={t("upgrade.verifyTitle")} desc={t("upgrade.verifyDesc")} closeLabel={t("common.close")}>
      {record && (
        <>
          <section className="v-stack v-stack--sm" aria-labelledby="upgrade-verify-step1">
            <h3 id="upgrade-verify-step1" className="v-section">1. {t("upgrade.verifyStep1")}</h3>
            <Rows>
              <Row label={t("verify.locked")}><span title={record.serverSeedHash}>{short(record.serverSeedHash)}</span></Row>
            </Rows>
            <p className="v-small">{t("verify.localNote")}</p>
          </section>

          <section className="v-stack v-stack--sm" aria-labelledby="upgrade-verify-step2">
            <h3 id="upgrade-verify-step2" className="v-section">2. {t("verify.step2")}</h3>
            <ChainRecordView record={NO_CHAIN_RECORD} noneBody={t("upgrade.chainNone")} />
          </section>

          <section className="v-stack v-stack--sm" aria-labelledby="upgrade-verify-step3">
            <h3 id="upgrade-verify-step3" className="v-section">3. {t("verify.step3")}</h3>
            <Rows>
              <Row label={t("verify.seed")}><span title={record.serverSeed}>{short(record.serverSeed)}</span></Row>
              <Row label={t("verify.client")}><span title={record.clientSeed}>{short(record.clientSeed)}</span></Row>
              <Row label={t("verify.round")}>{record.nonce.toLocaleString("en-US")}</Row>
              <Row label={t("upgrade.stakeValue")}>{fmt(record.stake.valueUsdt)}</Row>
              <Row label={t("upgrade.targetValue")}>{fmt(record.target.valueUsdt)}</Row>
              {out !== "failed" && <Row label={t("upgrade.chance")}>{!done ? wait : done.chanceUnits === null ? "" : t("upgrade.chanceValue", { pct: chanceText(done.chanceUnits) })}</Row>}
              {out !== "failed" && <Row label={t("verify.number")}>{done ? done.roll.toLocaleString("en-US") : wait}</Row>}
              {out !== "failed" && <Row label={t("upgrade.rolled")}>{done ? rollText(done.roll) : wait}</Row>}
              {out !== "failed" && <Row label={t("upgrade.outcome")}>{!done ? wait : done.won === null ? "" : t(done.won ? "upgrade.resultWon" : "upgrade.resultLost")}</Row>}
            </Rows>
            {done && <Line fail={!done.ok}>{t(done.ok ? "upgrade.verifyOk" : "upgrade.verifyBad")}</Line>}
            {out === "failed" && <Line fail>{t("verify.failed")}</Line>}
            <p className="v-small">{t("upgrade.formula")}</p>
          </section>

        </>
      )}
    </Sheet>
  );
}
