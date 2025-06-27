import * as React from "react"
import { getUsers } from "@/api/users"
import { DataTable } from "./data-table"
import { type User } from "./columns"

type Props = {
  value: string[]
  onChange: (userIds: string[]) => void
}

export function UserTableSelector({ value, onChange }: Props) {
  const [users, setUsers] = React.useState<User[]>([])

  React.useEffect(() => {
    getUsers().then(setUsers)
  }, [])

  return (
    <DataTable data={users} value={value} onChange={onChange} />
  )
}