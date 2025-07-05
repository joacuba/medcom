import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserSelector } from "@/components/UserSelector";
import { DoctorSelector } from "@/components/DoctorSelector";
import { UserForm } from "@/components/UserForm";
import { DoctorForm } from "@/components/DoctorForm";
import { Map } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { runBenchmark } from "@/api/benchmark";
import { getUsers } from "@/api/users";
import { getDoctors } from "@/api/doctors";
import { UserTableSelector } from "@/components/users-table/UserTableSelector";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  ActivitySquare,
  BarChart2,
  Folder,
  Users,
  UserPlus,
  UserCheck,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

function BarChart({ timings }: { timings: Record<string, number> }) {
  // Scale to microseconds for better visualization
  const scaledTimings = Object.fromEntries(
    Object.entries(timings).map(([k, v]) => [k, v * 1e6]),
  );
  const max = Math.max(
    ...Object.values(scaledTimings).filter((v) => typeof v === "number"),
    1,
  );

  return (
    <div className="flex gap-4 items-end h-32 mt-4">
      {Object.entries(scaledTimings)
        .filter(([_, v]) => typeof v === "number" && !isNaN(v))
        .map(([k, v]) => (
          <div key={k} className="flex flex-col items-center">
            <div
              className="bg-primary w-8 rounded"
              style={{ height: `${(v / max) * 100}%` }}
              title={v.toFixed(2) + " μs"}
            />
            <span className="text-xs mt-1">{k}</span>
            <span className="text-xs">{v.toFixed(2)} μs</span>
          </div>
        ))}
    </div>
  );
}

function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);
  if (users.length === 0) return <p>No users found.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Latitude</TableHead>
          <TableHead>Longitude</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u._id}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.age ?? '-'}</TableCell>
            <TableCell>{u.phone_number ?? '-'}</TableCell>
            <TableCell>{u.latitude}</TableCell>
            <TableCell>{u.longitude}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DoctorsList() {
  const [doctors, setDoctors] = useState<any[]>([]);
  useEffect(() => {
    getDoctors().then(setDoctors);
  }, []);
  if (doctors.length === 0) return <p>No doctors found.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Specialty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {doctors.map((d) => (
          <TableRow key={d._id}>
            <TableCell>{d.name}</TableCell>
            <TableCell>{d.email}</TableCell>
            <TableCell>{d.specialty}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("map");
  const [doctorId, setDoctorId] = useState<string>();
  const [userIds, setUserIds] = useState<string[]>([]);
  const [timings, setTimings] = useState<Record<string, number>>({});
  const [tspOrder, setTspOrder] = useState<number[]>([]);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState<string>("tsp");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [priorities, setPriorities] = useState<{ [userId: string]: boolean }>({});

  useEffect(() => {
    getUsers().then(setAllUsers);
    getDoctors().then(setAllDoctors);
  }, []);

  const selectedUsers = allUsers.filter(u => userIds.includes(u._id));
  const selectedDoctor = allDoctors.find(d => d._id === doctorId);

  const handleStart = async () => {
    console.log("Start button clicked", { doctorId, userIds, algorithm });
    if (!doctorId || userIds.length === 0) return;
    setLoading(true);
    try {
      console.log("Selected user IDs:", userIds);
      const res = await runBenchmark({ doctorId, userIds, algorithm, priorities });
      setTimings({
        floydWarshall: res.fwTime,
        dijkstra: res.dijkstraTime,
        bellmanFord: res.bellmanFordTime,
      });
      setTspOrder(Array.isArray(res.tspRouteOrder) ? res.tspRouteOrder : []);
      setRoute(
        res.routeGeoJSON && Array.isArray(res.routeGeoJSON)
          ? {
              type: "FeatureCollection",
              features: res.routeGeoJSON.map((geometry: any) => ({
                type: "Feature",
                geometry,
                properties: {},
              })),
            }
          : undefined,
      );
      setTotalTime(typeof res.totalTime === "number" ? res.totalTime : null);
      console.log("New route set:", res.routeGeoJSON);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FFF7ED]">
      <aside className="w-64 min-h-screen flex-shrink-0 flex flex-col bg-white border-r shadow-sm bg-[#FFF7ED]">
        <Tabs
          value={tab}
          onValueChange={setTab}
          orientation="vertical"
          className="flex-1 flex p-4 flex-col justify-start content-start bg-[#FFF7ED]"
        >
          <TabsList className="flex flex-col justify-start content-start w-full gap-4 bg-transparent shadow-none border-none p-0">
            <TabsTrigger
              value="map"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-[#FFDAA8] transition-colors data-[state=active]:bg-[#FFDAA8] data-[state=active]:text-primary justify-start text-left"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="doctors"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-[#FFDAA8] transition-colors data-[state=active]:bg-[#FFD7A2] data-[state=active]:text-primary justify-start text-left"
            >
              <UserCheck className="w-5 h-5" />
              Doctors
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-[#FFDAA8] transition-colors data-[state=active]:bg-[#FFD7A2] data-[state=active]:text-primary justify-start text-left"
            >
              <Users className="w-5 h-5" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="add-user"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-[#FFDAA8] transition-colors data-[state=active]:bg-[#FFD7A2] data-[state=active]:text-primary justify-start text-left"
            >
              <UserPlus className="w-5 h-5" />
              Add User
            </TabsTrigger>
            <TabsTrigger
              value="add-doctor"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-[#FFDAA8] transition-colors data-[state=active]:bg-[#FFD7A2] data-[state=active]:text-primary justify-start text-left"
            >
              <ActivitySquare className="w-5 h-5" />
              Add Doctor
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </aside>
      <main className="flex-1 p-6 overflow-auto bg-[#FFF7ED]">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsContent value="map">
            <div className="mt-6 mb-6 h-[400px]">
              <Map route={route} selectedUsers={selectedUsers} selectedDoctor={selectedDoctor} />
            </div>
            {totalTime !== null && (
              <div className="mb-4 text-lg font-semibold text-gray-700">
                Total travel time: {(totalTime / 60).toFixed(1)} min
              </div>
            )}
            <div className="flex gap-4 mb-4">
              <DoctorSelector value={doctorId} onChange={setDoctorId} />
              <div className="flex-1">
                <UserTableSelector
                  value={userIds}
                  onChange={setUserIds}
                  priorities={priorities}
                  onPrioritiesChange={setPriorities}
                />
              </div>
              <div>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tsp">TSP</SelectItem>
                    <SelectItem value="floydWarshall">
                      Floyd-Warshall
                    </SelectItem>
                    <SelectItem value="dijkstra">Dijkstra</SelectItem>
                    <SelectItem value="bellmanFord">Bellman-Ford</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStart}
                disabled={loading || !doctorId || userIds.length === 0}
                className={
                  loading || !doctorId || userIds.length === 0
                    ? "bg-[#FB923C] text-white cursor-not-allowed"
                    : "bg-[#22C55E] hover:bg-blue-700 text-white"
                }
              >
                {loading ? "Running..." : "Start"}
              </Button>
            </div>
            {Object.keys(timings).length > 0 && <BarChart timings={timings} />}
            {/*tspOrder.length > 0 && (
              <div className="mt-4 text-sm">
                <b>TSP Order:</b> {tspOrder.join(", ")}
              </div>
            )*/}
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
  );
}

