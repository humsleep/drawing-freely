"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/",          label: "둘러보기", match: ["/", "/ranking"], Icon: HomeIcon  },
  { href: "/create",    label: "만들기",   match: ["/create"],        Icon: PlusIcon  },
  { href: "/templates", label: "도안",     match: ["/templates"],     Icon: DocIcon   },
  { href: "/me",        label: "내 작품",  match: ["/me"],            Icon: UserIcon  },
] as const;

export function TabBar() {
  const path = usePathname();
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 sm:max-w-2xl">
        {TABS.map(({ href, label, match, Icon }) => {
          const active = match.some((m) =>
            m === "/" ? path === "/" : path.startsWith(m),
          );
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                "flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium " +
                (active ? "text-stone-900" : "text-stone-400")
              }
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const ICON_CLASS = "size-6";
const PATH_PROPS = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} {...PATH_PROPS}>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10v9h14v-9" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} {...PATH_PROPS}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} {...PATH_PROPS}>
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M14 3v6h6" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} {...PATH_PROPS}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </svg>
  );
}
