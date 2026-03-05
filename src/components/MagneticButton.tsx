"use client";

import { motion } from "framer-motion";
import { MouseEvent, ReactNode, useRef } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function MagneticButton({
  children,
  className,
  href,
  target,
  rel,
  download,
  onClick,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);

  const handleMove = (event: MouseEvent<HTMLElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    ref.current.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0px, 0px)";
  };

  if (href) {
    return (
      <motion.a
        ref={ref as never}
        href={href}
        target={target}
        rel={rel}
        download={download}
        data-magnetic="true"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className={`magnetic inline-flex items-center justify-center transition duration-200 ${className ?? ""}`}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as never}
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-magnetic="true"
      onMouseMove={disabled ? undefined : handleMove}
      onMouseLeave={disabled ? undefined : handleLeave}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`magnetic inline-flex items-center justify-center transition duration-200 ${className ?? ""}`}
    >
      {children}
    </motion.button>
  );
}
