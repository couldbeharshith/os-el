import { ProcessMemory } from "@/app/types/memory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMemory } from "@/app/utils/format"

export function ProcessMemoryView({ data }: { data: ProcessMemory }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Process Memory Details</CardTitle>
          <CardDescription>PID: {data.pid} - {data.command}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary Table */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Memory Totals</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Total Memory</TableHead>
                    <TableHead>RSS</TableHead>
                    <TableHead>Dirty Pages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatMemory(data.totals.kbytes)}</TableCell>
                    <TableCell>{formatMemory(data.totals.rss)}</TableCell>
                    <TableCell>{formatMemory(data.totals.dirty)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Detailed Memory Map */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Memory Map Details</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>RSS</TableHead>
                      <TableHead>Dirty</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Mapping</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.entries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{entry.address}</TableCell>
                        <TableCell>{formatMemory(entry.kbytes)}</TableCell>
                        <TableCell>{formatMemory(entry.rss)}</TableCell>
                        <TableCell>{formatMemory(entry.dirty)}</TableCell>
                        <TableCell>{entry.mode}</TableCell>
                        <TableCell>{entry.mapping}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 