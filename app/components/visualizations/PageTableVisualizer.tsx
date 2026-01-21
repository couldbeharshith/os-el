"use client"

import { PageTableEntry } from "@/app/types/memory"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PageTableVisualizer({ entries }: { entries: PageTableEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Table Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Virtual Address</TableHead>
              <TableHead>Physical Address</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono">{entry.virtual_addr}</TableCell>
                <TableCell className="font-mono">{entry.physical_addr}</TableCell>
                <TableCell>{entry.page_size} bytes</TableCell>
                <TableCell>
                  {entry.is_present && 'P'}
                  {entry.is_writable && 'W'}
                  {entry.is_executable && 'X'}
                  {entry.is_cached && 'C'}
                  {entry.is_dirty && 'D'}
                </TableCell>
                <TableCell>{entry.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 