import * as React from "react"
import { getUsers } from "@/api/users"
import { DataTable } from "./data-table"
import { type User } from "./columns"

type Props = {
  value: string[]
  onChange: (userIds: string[]) => void
  priorities?: { [userId: string]: boolean }
  onPrioritiesChange?: (priorities: { [userId: string]: boolean }) => void
}

export function UserTableSelector({ value, onChange, priorities: prioritiesProp, onPrioritiesChange }: Props) {
  const [users, setUsers] = React.useState<User[]>([])
  const [priorities, setPriorities] = React.useState<{ [userId: string]: boolean }>({})

  React.useEffect(() => {
    getUsers().then(setUsers)
  }, [])

  // Sync priorities with prop if controlled
  React.useEffect(() => {
    if (prioritiesProp) setPriorities(prioritiesProp)
  }, [prioritiesProp])

  const handlePriorityChange = (userId: string, value: boolean) => {
    setPriorities(prev => {
      const next = { ...prev, [userId]: value }
      onPrioritiesChange?.(next)
      return next
    })
  }

  return (
    <DataTable
      data={users}
      value={value}
      onChange={onChange}
      priorities={priorities}
      onPriorityChange={handlePriorityChange}
    />
  )
}