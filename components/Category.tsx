"use client";

import { useState } from "react";

interface CategoryItem {
  value: string;
  found: number;
}

interface CategoryProps {
  onSelect?: (value: string) => void;
}

const Category = ({ onSelect }: CategoryProps) => {
  const data: CategoryItem[] = [
    { value: "ทั้งหมด", found: 20 },
    { value: "ยอดฮิต", found: 2 },
    { value: "โปรโมชั่น", found: 5 },
    { value: "ชุดสุดคุ้ม", found: 4 },
    { value: "เนื้อสัตว์", found: 8 },
    { value: "ทะเล", found: 10 },
    { value: "ของทานเล่น", found: 10 },
    { value: "เครื่องดื่ม", found: 13 },
    { value: "อื่นๆ", found: 0 },
  ];

  const [active, setActive] = useState("ทั้งหมด");

  const handleSelect = (value: string) => {
    setActive(value);
    onSelect?.(value);
  };

  return (
    <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {data.map((item) => {
        const isActive = item.value === active;
        const isEmpty = item.found === 0;

        return (
          <button
            key={item.value}
            type="button"
            disabled={isEmpty}
            onClick={() => handleSelect(item.value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-[18px] py-[9px] text-xs transition-colors disabled:opacity-40 ${
              isActive
                ? "bg-red-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span>{item.value}</span>
            <span
              className={`rounded-full px-1.5 text-[10px] ${
                isActive ? "bg-white/25 text-white" : "bg-background text-muted-foreground"
              }`}
            >
              {item.found}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default Category;