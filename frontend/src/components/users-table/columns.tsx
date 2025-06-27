import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useRef } from "react"

export type User = {
  _id: string
  name: string
  email: string
  age?: number
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const wrapperRef = useRef<HTMLSpanElement>(null)
      useEffect(() => {
        if (wrapperRef.current) {
          const input = wrapperRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement | null
          if (input) {
            input.indeterminate = table.getIsSomePageRowsSelected()
          }
        }
      }, [table.getIsSomePageRowsSelected()])
      return (
        <span ref={wrapperRef}>
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
          />
        </span>
      )
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={row.getToggleSelectedHandler()}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "age",
    header: "Edad",
    cell: ({ row }) => row.original.age ?? "-",
  },
]
