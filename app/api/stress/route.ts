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
      const { CAP_LIMIT_MB } = config

      // Convert MB to bytes for stress-ng
      const memoryBytes = `${CAP_LIMIT_MB}M`

      console.log(`Starting stress-ng with ${memoryBytes} memory allocation`)

      // Use stress-ng to allocate and hold memory
      // --vm 1: spawn 1 worker
      // --vm-bytes: amount of memory to allocate
      // --vm-keep: keep memory allocated (don't free and reallocate)
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

      // Give it a moment to start
      await new Promise(resolve => setTimeout(resolve, 500))

      return NextResponse.json({ 
        status: 'started',
        message: `Memory stress test started - allocating ${CAP_LIMIT_MB}MB`,
        pid: stressProcess.pid,
        config,
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
      stressProcess.kill('SIGTERM')
      
      // Force kill if it doesn't stop in 2 seconds
      setTimeout(() => {
        if (stressProcess) {
          stressProcess.kill('SIGKILL')
        }
      }, 2000)
      
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
