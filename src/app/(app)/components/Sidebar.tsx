"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  WindowCollapseLeftIcon,
  WindowCollapseRightIcon,
} from "../../../../public/icons";
import Freya from "../../../../public/logos/logo.png";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <nav
      className={`hidden lg:block bg-background-800 h-screen ${
        isCollapsed ? "w-18 md:w-20" : "w-56 md:w-64"
      } px-2 py-4 shadow-right transition-all duration-300`}
    >
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } gap-2 mb-10 w-full`}
      >
        <Link href="/" className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <Image src={Freya} alt="" className="w-1/4 invert-75" />
              <span className="text-2xl font-bold text-text-100">Freya</span>
            </>
          )}
        </Link>
        <div className="w-1/3">
          {isCollapsed ? (
            <WindowCollapseRightIcon
              onClick={() => setIsCollapsed(!isCollapsed)}
              title="Expand"
            />
          ) : (
            <WindowCollapseLeftIcon
              onClick={() => setIsCollapsed(!isCollapsed)}
              title="collapse"
            />
          )}
        </div>
      </div>
    </nav>
  );
}
