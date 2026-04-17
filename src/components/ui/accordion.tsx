"use client"

import * as React from "react"
import { Plus, Minus } from "lucide-react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"

import { cn } from "@/lib/utils"

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group rounded-2xl overflow-hidden transition-all duration-300",
        "data-[state=closed]:bg-card data-[state=closed]:border data-[state=closed]:border-border data-[state=closed]:hover:border-primary/30 data-[state=closed]:hover:shadow-md data-[state=closed]:hover:shadow-primary/5",
        "data-[state=open]:bg-primary data-[state=open]:shadow-lg data-[state=open]:shadow-primary/20",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50",
          "data-[state=open]:text-primary-foreground data-[state=closed]:text-foreground group-hover:data-[state=closed]:text-primary",
          className
        )}
        {...props}
      >
        {children}
        <span
          className={cn(
            "shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
            "group-data-[state=open]:bg-primary-foreground/15 group-data-[state=open]:text-primary-foreground",
            "group-data-[state=closed]:bg-primary/8 group-data-[state=closed]:text-primary group-data-[state=closed]:border group-data-[state=closed]:border-primary/20"
          )}
        >
          <Plus className="w-3.5 h-3.5 group-data-[state=open]:hidden transition-transform" />
          <Minus className="w-3.5 h-3.5 group-data-[state=closed]:hidden transition-transform" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div
        className={cn(
          "mx-5 border-t transition-colors duration-300",
          "group-data-[state=open]:border-primary-foreground/15 group-data-[state=closed]:border-border"
        )}
      />
      <div
        className={cn(
          "px-5 py-4 leading-relaxed transition-colors duration-300",
          "group-data-[state=open]:text-primary-foreground/80 group-data-[state=closed]:text-muted-foreground",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
