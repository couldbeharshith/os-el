import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { ProcessMemory, ProcessMemoryEntry } from '@/app/types/memory'

const execAsync = promisify(exec)

// Helper function to parse memory values from kB to GB
const kbToGb = (kb: number) => kb / (1024 * 1024)

export async function GET() {
  try {
    const { stdout, stderr } = await execAsync('echo "1\n2\n3\n6\n" | ./bin/a')
    
    if (stderr) {
      console.error('VMD Error:', stderr)
      return NextResponse.json({ error: 'VMD process error' }, { status: 500 })
    }

    const sections = stdout.split('Memory Analysis Menu:')
    const systemMemorySection = sections[1]?.split('\n') || []
    
    // Create a mapping of memory fields
    const memoryFields: Record<string, string> = {}
    systemMemorySection.forEach(line => {
      const [key, valueStr] = line.split(':').map(s => s.trim())
      if (valueStr) {
        memoryFields[key] = valueStr.split(' ')[0]
      }
    })

    const systemMemory = {
      // Core Memory
      total: parseInt(memoryFields['MemTotal']) || 0,
      free: parseInt(memoryFields['MemFree']) || 0,
      available: parseInt(memoryFields['MemAvailable']) || 0,
      buffers: parseInt(memoryFields['Buffers']) || 0,
      cached: parseInt(memoryFields['Cached']) || 0,
      
      // Swap Memory
      swapTotal: parseInt(memoryFields['SwapTotal']) || 0,
      swapFree: parseInt(memoryFields['SwapFree']) || 0,
      swapCached: parseInt(memoryFields['SwapCached']) || 0,
      
      // Memory States
      active: parseInt(memoryFields['Active']) || 0,
      inactive: parseInt(memoryFields['Inactive']) || 0,
      dirty: parseInt(memoryFields['Dirty']) || 0,
      mapped: parseInt(memoryFields['Mapped']) || 0,
      
      // Anonymous Memory
      anonPages: parseInt(memoryFields['AnonPages']) || 0,
      activeAnon: parseInt(memoryFields['Active(anon)']) || 0,
      inactiveAnon: parseInt(memoryFields['Inactive(anon)']) || 0,
      
      // File Memory
      activeFile: parseInt(memoryFields['Active(file)']) || 0,
      inactiveFile: parseInt(memoryFields['Inactive(file)']) || 0,
      
      // Other Memory
      slab: parseInt(memoryFields['Slab']) || 0,
      kernelStack: parseInt(memoryFields['KernelStack']) || 0,
      pageTables: parseInt(memoryFields['PageTables']) || 0,
      committed: parseInt(memoryFields['Committed_AS']) || 0,
      vmallocUsed: parseInt(memoryFields['VmallocUsed']) || 0,
    }

    // Parse process memory (from selection 2)
    const processMemorySection = sections[2]?.split('\n') || []
    let processMemory: ProcessMemory = {
      pid: 0,
      command: '',
      entries: [],
      totals: {
        kbytes: 0,
        rss: 0,
        dirty: 0
      }
    }

    // Find the process info line and parse entries
    const processLines = processMemorySection
      .map(line => line.trim())
      .filter(line => line.length > 0) // Remove empty lines

    // Find PID line (format: "49140:   ./a")
    const pidLine = processLines.find(line => /^\d+:/.test(line))
    if (pidLine) {
      const [pidStr, command] = pidLine.split(':')
      processMemory.pid = parseInt(pidStr.trim())
      processMemory.command = command.trim()

      // Find the start of memory entries (after "Address Kbytes RSS Dirty Mode Mapping" header)
      const headerIndex = processLines.findIndex(line => line.startsWith('Address'))
      if (headerIndex !== -1) {
        const entries: ProcessMemoryEntry[] = processLines
          .slice(headerIndex + 1) // Skip everything before and including header
          .filter(line => /^[0-9a-f]/.test(line)) // Only take lines starting with hex address
          .map(line => {
            const parts = line.split(/\s+/)
            const [address, kbytes, rss, dirty, mode, ...mappingParts] = parts
            
            const entry: ProcessMemoryEntry = {
              address,
              kbytes: parseInt(kbytes) || 0,
              rss: parseInt(rss) || 0,
              dirty: parseInt(dirty) || 0,
              mode,
              mapping: mappingParts.join(' ').trim()
            }

            // Update totals
            processMemory.totals.kbytes += entry.kbytes
            processMemory.totals.rss += entry.rss
            processMemory.totals.dirty += entry.dirty

            return entry
          })

        processMemory.entries = entries
      }
    }

    // Parse memory mappings (from selection 3)
    const memoryMappingSection = sections[3]?.split('\n') || []
    const memoryMappings = memoryMappingSection
      .filter(line => line.includes('-'))
      .map(line => {
        const [address, perms, offset, dev, inode, ...pathParts] = line.trim().split(/\s+/)
        return {
          address,
          perms: perms.replace('p', ''),
          offset,
          dev,
          inode,
          pathname: pathParts.join(' ').trim()
        }
      })
      .filter(mapping => mapping.pathname) // Remove empty mappings

    return NextResponse.json({ 
      systemMemory,
      processMemory,
      memoryMappings
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memory data' }, 
      { status: 500 }
    )
  }
} 