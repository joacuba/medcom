import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserSelector } from "@/components/UserSelector"
import { DoctorSelector } from "@/components/DoctorSelector"
import { UserForm } from "@/components/UserForm"
import { DoctorForm } from "@/components/DoctorForm"
import { Map } from "@/components/Map"
import { Button } from "@/components/ui/button"
import { runBenchmark } from "@/api/benchmark"
import { getUsers } from "@/api/users"
import { getDoctors } from "@/api/doctors"
import { UserTableSelector } from "@/components/users-table/UserTableSelector"

function BarChart({ timings }: { timings: Record<string, number> }) {
  const max = Math.max(...Object.values(timings), 1)
  return (
    <div className="flex gap-4 items-end h-32 mt-4">
      {Object.entries(timings).map(([k, v]) => (
        <div key={k} className="flex flex-col items-center">
          <div
            className="bg-primary w-8 rounded"
            style={{ height: `${(v / max) * 100}%` }}
            title={v.toFixed(3) + "s"}
          />
          <span className="text-xs mt-1">{k}</span>
        </div>
      ))}
    </div>
  )
}

function UsersList() {
  const [users, setUsers] = useState<any[]>([])
  useEffect(() => {
    getUsers().then(setUsers)
  }, [])
  if (users.length === 0) return <p>No users found.</p>
  return (
    <ul>
      {users.map(u => (
        <li key={u._id}>{u.name} ({u.email})</li>
      ))}
    </ul>
  )
}

function DoctorsList() {
  const [doctors, setDoctors] = useState<any[]>([])
  useEffect(() => {
    getDoctors().then(setDoctors)
  }, [])
  if (doctors.length === 0) return <p>No doctors found.</p>
  return (
    <ul>
      {doctors.map(d => (
        <li key={d._id}>{d.name} ({d.email}) - {d.specialty}</li>
      ))}
    </ul>
  )
}

export default function Dashboard() {
  const [tab, setTab] = useState("map")
  const [doctorId, setDoctorId] = useState<string>()
  const [userIds, setUserIds] = useState<string[]>([])
  const [timings, setTimings] = useState<Record<string, number>>({})
  const [tspOrder, setTspOrder] = useState<number[]>([])
  const [route, setRoute] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    console.log("Start button clicked", { doctorId, userIds })
    if (!doctorId || userIds.length === 0) return
    setLoading(true)
    try {
      console.log("Selected user IDs:", userIds)
      const res = await runBenchmark({ doctorId, userIds })
      setTimings({
        floydWarshall: res.floydWarshallTime,
        dijkstra: res.dijkstraTime,
        bellmanFord: res.bellmanFordTime,
      })
      setTspOrder(res.tspRouteOrder)
      setRoute(res.routeGeometry)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted h-screen flex flex-col overflow-auto p-4">
        <Tabs value={tab} onValueChange={setTab} orientation="vertical" className="flex-1 flex flex-col">
          <TabsList className="flex flex-col gap-2 justify-start">
            <TabsTrigger value="map">Dashboard</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="add-user">Add User</TabsTrigger>
            <TabsTrigger value="add-doctor">Add Doctor</TabsTrigger>
          </TabsList>
        </Tabs>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsContent value="map">
            <div className="flex gap-4 mb-4">
              <DoctorSelector value={doctorId} onChange={setDoctorId} />
              <div className="flex-1">
                <UserTableSelector value={userIds} onChange={setUserIds} />
              </div>
              <Button onClick={handleStart} disabled={loading || !doctorId || userIds.length === 0}>
                {loading ? "Running..." : "Start"}
              </Button>
            </div>
            {Object.keys(timings).length > 0 && <BarChart timings={timings} />}
            {tspOrder.length > 0 && (
              <div className="mt-4 text-sm">
                <b>TSP Order:</b> {tspOrder.join(", ")}
              </div>
            )}
            <div className="mt-6 h-[400px]">
              <Map route={route} />
            </div>
          </TabsContent>
          <TabsContent value="doctors">
            <DoctorsList />
          </TabsContent>
          <TabsContent value="users">
            <UsersList />
          </TabsContent>
          <TabsContent value="add-user">
            <UserForm />
          </TabsContent>
          <TabsContent value="add-doctor">
            <DoctorForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 