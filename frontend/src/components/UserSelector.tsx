import { useEffect, useState } from "react"
import MultipleSelector, { type Option } from "@/components/ui/multiple-selector"
import { getUsers } from "@/api/users"

type User = { _id: string; name: string }

type Props = {
  value?: string[]
  onChange?: (userIds: string[]) => void
}

export function UserSelector({ value, onChange }: Props) {
  const [options, setOptions] = useState<Option[]>([])
  const [selected, setSelected] = useState<Option[]>([])

  useEffect(() => {
    getUsers().then((users: User[]) => {
      setOptions(users.map(u => ({ value: u._id, label: u.name })))
    })
  }, [])

  useEffect(() => {
    if (value && options.length) {
      setSelected(options.filter(o => value.includes(o.value)))
    }
  }, [value, options])

  return (
    <MultipleSelector
      options={options}
      value={selected}
      onChange={opts => {
        setSelected(opts)
        onChange?.(opts.map(o => o.value))
      }}
      placeholder="Select users..."
    />
  )
} 