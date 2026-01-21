import { MemoryMapping } from "@/app/types/memory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function MemoryMappingView({ data }: { data: MemoryMapping[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Mappings</CardTitle>
        <CardDescription>Virtual memory regions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Offset</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Inode</TableHead>
                <TableHead>Pathname</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((mapping, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{mapping.address}</TableCell>
                  <TableCell>{mapping.perms}</TableCell>
                  <TableCell>{mapping.offset}</TableCell>
                  <TableCell>{mapping.dev}</TableCell>
                  <TableCell>{mapping.inode}</TableCell>
                  <TableCell className="font-mono max-w-xs truncate">
                    {mapping.pathname}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 