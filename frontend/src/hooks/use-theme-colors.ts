"use client";
import { useEffect, useState } from "react";

export function useThemeColors() {
  const [colors, setColors] = useState({
    fgColor: "#171717",
    bgColor: "#fafafa",
    acColor: "#fa1717",
    edColor: "#e9e9e9",
    darkColor: "#171717",
    lightColor: "#fafafa",
  });

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setColors({
        fgColor: cs.getPropertyValue("--foreground").trim(),
        bgColor: cs.getPropertyValue("--background").trim(),
        acColor: cs.getPropertyValue("--accent").trim(),
        edColor: cs.getPropertyValue("--edge").trim(),
        darkColor: cs.getPropertyValue("--darkcolor").trim(),
        lightColor: cs.getPropertyValue("--lightcolor").trim(),
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

  return colors; // { fg, bg, ac, ed} いずれも CSSカラー文字列（# / rgb / hsl …）
}
