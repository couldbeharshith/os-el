import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { getStressConfig } from '@/app/config/stress'

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
      const { CHUNK_SIZE_MB, CAP_LIMIT_MB, ALLOCATION_INTERVAL_MS } = config

      // Start stress test: allocate memory in chunks
      stressProcess = spawn('node', ['-e', `
        const chunks = [];
        const allocSize = ${CHUNK_SIZE_MB} * 1024 * 1024; // ${CHUNK_SIZE_MB}MB chunks
        let totalMB = 0;
        
        console.log('Starting memory stress test...');
        
        const interval = setInterval(() => {
          try {
            chunks.push(Buffer.alloc(allocSize));
            totalMB += ${CHUNK_SIZE_MB};
            console.log(\`Allocated: \${totalMB}MB\`);
            
            if (totalMB >= ${CAP_LIMIT_MB}) { // Cap at ${CAP_LIMIT_MB}MB
              console.log('Reached ${CAP_LIMIT_MB}MB cap - holding memory');
              clearInterval(interval);
              // Don't exit - keep holding the memory
            }
          } catch (e) {
            console.log('Memory allocation limit reached');
            clearInterval(interval);
            // Don't exit - keep holding the memory
          }
        }, ${ALLOCATION_INTERVAL_MS});
        
        // Keep process alive indefinitely
        process.on('SIGTERM', () => {
          console.log('Stress test stopped - releasing memory');
          process.exit(0);
        });
        
        // Prevent process from exiting
        setInterval(() => {}, 1000000);
      `])

      stressProcess.stdout.on('data', (data: Buffer) => {
        console.log(`Stress: ${data.toString()}`)
      })

      stressProcess.on('exit', () => {
        stressProcess = null
      })

      return NextResponse.json({ 
        status: 'started',
        message: `Memory stress test started - allocating up to ${CAP_LIMIT_MB}MB`,
        pid: stressProcess.pid,
        config
      })
    } 
    
    else if (action === 'stop') {
      if (!stressProcess) {
        return NextResponse.json({ 
          status: 'not_running',
          message: 'No stress test is currently running'
        })
      }

      stressProcess.kill('SIGTERM')
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
