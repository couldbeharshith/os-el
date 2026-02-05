import { NextResponse } from 'next/server'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import { getStressConfig } from '@/app/config/stress'

const execAsync = promisify(exec)
let stressProcess: any = null

export async function POST(request: Request) {
  try {
    const { action } = await request.json()

    if (action === 'start') {
      if (stressProcess) {
        return NextResponse.json({ 
          status: 'already_running',
          message: 'Memory stress test is already running'
        })
      }

      const config = await getStressConfig()
      let { CAP_LIMIT_MB } = config

      // Check available memory to prevent crashes
      try {
        const { stdout } = await execAsync('free -m | grep "Mem:" | awk \'{print $7}\'')
        const availableMB = parseInt(stdout.trim())
        
        // Use at most 60% of available memory to prevent OOM
        const safeLimitMB = Math.floor(availableMB * 0.6)
        
        if (CAP_LIMIT_MB > safeLimitMB) {
          console.log(`Reducing cap from ${CAP_LIMIT_MB}MB to ${safeLimitMB}MB (60% of available ${availableMB}MB)`)
          CAP_LIMIT_MB = safeLimitMB
        }
      } catch (err) {
        console.error('Failed to check available memory:', err)
      }

      // Ensure minimum of 100MB
      if (CAP_LIMIT_MB < 100) {
        CAP_LIMIT_MB = 100
      }

      const memoryBytes = `${CAP_LIMIT_MB}M`

      console.log(`Starting stress-ng with ${memoryBytes} memory allocation`)

      // Use stress-ng with safe options
      // --vm 1: spawn ONLY 1 worker (not 5!)
      // --vm-bytes: amount of memory to allocate
      // --vm-keep: keep memory allocated
      // --timeout 0: run indefinitely
      stressProcess = spawn('stress-ng', [
        '--vm', '1',
        '--vm-bytes', memoryBytes,
        '--vm-keep',
        '--timeout', '0',
        '--verbose'
      ])

      stressProcess.stdout.on('data', (data: Buffer) => {
        console.log(`stress-ng: ${data.toString()}`)
      })

      stressProcess.stderr.on('data', (data: Buffer) => {
        console.log(`stress-ng: ${data.toString()}`)
      })

      stressProcess.on('exit', (code: number) => {
        console.log(`stress-ng exited with code ${code}`)
        stressProcess = null
      })

      stressProcess.on('error', (err: Error) => {
        console.error(`stress-ng error:`, err)
        stressProcess = null
      })

      // Give it a moment to start
      await new Promise(resolve => setTimeout(resolve, 1000))

      return NextResponse.json({ 
        status: 'started',
        message: `Memory stress test started - allocating ${CAP_LIMIT_MB}MB`,
        pid: stressProcess?.pid,
        config: { ...config, CAP_LIMIT_MB },
        tool: 'stress-ng'
      })
    } 
    
    else if (action === 'stop') {
      if (!stressProcess) {
        return NextResponse.json({ 
          status: 'not_running',
          message: 'No stress test is currently running'
        })
      }

      console.log('Stopping stress-ng...')
      
      try {
        // Try graceful shutdown first
        stressProcess.kill('SIGTERM')
        
        // Force kill if it doesn't stop in 3 seconds
        setTimeout(() => {
          if (stressProcess) {
            console.log('Force killing stress-ng...')
            stressProcess.kill('SIGKILL')
            stressProcess = null
          }
        }, 3000)
      } catch (err) {
        console.error('Error stopping stress-ng:', err)
      }
      
      stressProcess = null

      return NextResponse.json({ 
        status: 'stopped',
        message: 'Memory stress test stopped and memory released'
      })
    }

    else if (action === 'status') {
      const config = await getStressConfig()
      return NextResponse.json({ 
        status: stressProcess ? 'running' : 'stopped',
        pid: stressProcess?.pid || null,
        config
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Stress API Error:', error)
    return NextResponse.json(
      { error: 'Failed to control stress test' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  const config = await getStressConfig()
  return NextResponse.json({ 
    status: stressProcess ? 'running' : 'stopped',
    pid: stressProcess?.pid || null,
    config
  })
}
