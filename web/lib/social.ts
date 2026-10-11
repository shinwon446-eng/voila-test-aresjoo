/**
 * 꼬리말의 팔로우 주소. 실제 계정 주소만 적는다.
 * 비워 둔 곳은 꼬리말에 그림만 나오고 누를 수 없다(없는 주소나 남의 계정으로 보내지 않는다).
 */
export type SocialKey = "x" | "instagram" | "youtube" | "telegram";

export const SOCIAL: Record<SocialKey, string> = {
  x: "",
  instagram: "",
  youtube: "",
  telegram: "",
};
