"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "./lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = es,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 bg-card rounded-[1.5rem] border border-border/50 shadow-2xl overflow-hidden relative", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-8 justify-center items-start",
        month: "space-y-6 w-full flex flex-col items-center",
        month_caption: "flex justify-center items-center h-10 mb-6 relative w-full",
        caption_label: "text-sm font-bold text-foreground tracking-tight capitalize bg-primary/10 px-6 py-2 rounded-2xl border border-primary/20 min-w-[140px] text-center",
        nav: "absolute top-0 left-0 right-0 flex items-center justify-between h-10 px-1",
        nav_button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "h-9 w-9 bg-background/80 backdrop-blur-sm p-0 opacity-80 hover:opacity-100 transition-all hover:bg-white hover:border-primary/50 z-20 rounded-xl shadow-md border-border/40"
        ),
        nav_button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "h-9 w-9 bg-background/80 backdrop-blur-sm p-0 opacity-80 hover:opacity-100 transition-all hover:bg-white hover:border-primary/50 z-20 rounded-xl shadow-md border-border/40"
        ),
        month_grid: "w-full border-collapse mx-auto",
        weekdays: "flex justify-between mb-2 border-b border-border/10 pb-3 w-full",
        weekday: "text-muted-foreground w-11 font-bold text-[0.65rem] uppercase text-center flex items-center justify-center tracking-[0.2em] opacity-50",
        weeks: "space-y-1.5 w-full",
        week: "flex w-full justify-between gap-1",
        day: cn(
          "h-10 w-10 p-0 font-medium transition-all duration-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary/20 hover:text-primary relative group",
          "aria-selected:opacity-100"
        ),
        day_button: "h-full w-full flex items-center justify-center rounded-xl",
        range_start: "day-range-start rounded-l-xl",
        range_end: "day-range-end rounded-r-xl",
        selected: cn(
          "!bg-primary !text-primary-foreground hover:!bg-primary/95 focus:!bg-primary shadow-xl shadow-primary/50 font-bold scale-110 z-10 border-2 border-white dark:border-primary/40"
        ),
        today: "border-2 border-primary/30 text-primary font-black bg-primary/5 ring-4 ring-primary/5",
        outside: "text-muted-foreground/10 opacity-20 aria-selected:bg-accent/40 aria-selected:text-muted-foreground/10 pointer-events-none",
        disabled: "text-muted-foreground opacity-10 cursor-not-allowed grayscale",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <ChevronLeft className="h-4 w-4" />
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
