import { useState } from "react"

export const Bad = ({ enabled }: { enabled: boolean }) => {
  if (enabled) {
    useState(0)
  }
  return null
}
