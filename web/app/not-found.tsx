"use client";
import { useEffect, useState } from "react";
import ko from "@/messages/v.ko.json";
import en from "@/messages/v.en.json";
import zh from "@/messages/v.zh.json";

const COPY = { ko: ko.state, en: en.state, zh: zh.state };
type Lang = keyof typeof COPY;

/** 없는 주소(로케일 밖). 문구는 새 문구 묶음에서 가져오고, 언어는 주소의 첫 마디로 고른다. */
export default function RootNotFound() {
  const [lang, setLang] = useState<Lang>("ko");
  useEffect(() => {
    const first = window.location.pathname.split("/").filter(Boolean).find((part) => part in COPY);
    if (first) setLang(first as Lang);
  }, []);
  const copy = COPY[lang];
  return (
    <div className="v-app">
      <main className="v-main v-main--col">
        <div className="v-stack v-stack--lg">
          <header><h1 className="v-title">{copy.notFoundTitle}</h1><p className="v-desc">{copy.notFoundDesc}</p></header>
          <a className="v-btn" href={"/" + lang}>{copy.toBoxes}</a>
        </div>
      </main>
    </div>
  );
}
