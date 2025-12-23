import { ReactNode } from "react"

export type LayoutProps = {
  children: ReactNode
  params?: Record<string, string | string[]>
  searchParams?: Record<string, string | string[]>
}