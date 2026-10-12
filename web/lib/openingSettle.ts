/**
 * 상품 하나를 USDT 로 받는 일(개봉 결과 자리, 여러 개 결과의 상품 상세, 보관함의 상품 상세).
 * 돈이 움직이는 코드는 한 벌이다: lib/takeBatch 의 settleTakeMany 를 그대로 부른다(같은 잠금, 같은 판정, 같은 계산).
 * 이 파일은 그 결과를 한 개 받기 화면이 말할 수 있는 상태로 옮길 뿐이다.
 *
 *   settled  잔액에 들어왔다. 상품이 받은 상태이고 그 상품의 입금 내역이 있다. amountUsdt 는 실제로 받은 금액(보관함 기록의 soldForUsdt)이다.
 *            already 가 참이면 이번에 새로 들어온 것이 아니라 전에 이미 받은 것이다(화면은 다시 더하지 않는다).
 *   pending  접수는 됐지만 잔액 반영이 아직이다. 화면은 "들어왔다"고 말하지 않는다
 *   failed   받지 못했다. 상품은 보관 중이고 입금 내역이 없다(다시 시도할 수 있다)
 *   unknown  처리 상태를 확인하지 못했다(상품과 입금 내역이 어긋난다). 스스로 다시 지급하지 않는다. 화면은 보관함과 지갑 내역을 확인하라고 말한다
 *
 * 지금의 브라우저 장부는 그 자리에서 끝나므로 pending 이 생기지 않는다. 서비스에 연결되면 생길 수 있어 상태는 갖춰 둔다.
 * 한계와 시험 스위치("voila.opening.fault")는 lib/takeBatch 머리말에 적었다.
 */
import { settleTakeMany } from "./takeBatch";

export { devOpeningFault } from "./takeBatch";

export type SettleOutcome = { status: "settled"; amountUsdt: number; already?: boolean } | { status: "pending" } | { status: "failed" } | { status: "unknown" };

export async function settleTake(ownedId: string): Promise<SettleOutcome> {
  const out = await settleTakeMany([ownedId]);
  if (out.status === "pending") return { status: "pending" };
  if (out.taken.length === 1) return { status: "settled", amountUsdt: out.taken[0].amountUsdt };
  if (out.already.length === 1) return { status: "settled", amountUsdt: out.already[0].amountUsdt, already: true };
  if (out.unknown.length > 0) return { status: "unknown" };
  return { status: "failed" };
}
