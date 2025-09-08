"use client";
import { useEffect, useState } from "react";

export function useThemeColors() {
  const [colors, setColors] = useState({
    fg: "#171717",
    bg: "#fafafa",
    ac: "#fa1717",
  });

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setColors({
        fg: cs.getPropertyValue("--foreground").trim(),
        bg: cs.getPropertyValue("--background").trim(),
        ac: cs.getPropertyValue("--accent").trim(),
      });
    };

    read(); // 初回

    // OSテーマ変更（ライト↔ダーク）
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => read();
    mql.addEventListener("change", onChange);

    // サイト内トグルにも追随（data-theme/class/style の変化を監視）
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });

    return () => {
      mql.removeEventListener("change", onChange);
      mo.disconnect();
    };
  }, []);

  return colors; // { fg, bg, ac } いずれも CSSカラー文字列（# / rgb / hsl …）
}
