import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDoctors } from "@/api/doctors"

type Doctor = { _id: string; name: string }

type Props = {
  value?: string
  onChange?: (doctorId: string) => void
}

export function DoctorSelector({ value, onChange }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    getDoctors().then((docs: Doctor[]) => setDoctors(docs))
  }, [])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select doctor..." />
      </SelectTrigger>
      <SelectContent>
        {doctors.map(d => (
          <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 