import type { ColumnDef, TableMeta } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useRef } from "react"

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends object = unknown> {
    priorities?: { [userId: string]: boolean };
    onPriorityChange?: (userId: string, value: boolean) => void;
  }
}

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
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
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
        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "prioridad",
    header: "Prioridad",
    cell: ({ row, table }) => {
      const priorities = table.options.meta?.priorities || {};
      const onPriorityChange = table.options.meta?.onPriorityChange;
      const userId = row.original._id;
      return (
        <Checkbox
          checked={!!priorities[userId]}
          onCheckedChange={checked => onPriorityChange?.(userId, !!checked)}
          aria-label="Prioridad"
          className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
        />
      );
    },
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
