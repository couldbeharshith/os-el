import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

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

      // Start stress test: allocate memory in chunks
      stressProcess = spawn('node', ['-e', `
        const chunks = [];
        const allocSize = 50 * 1024 * 1024; // 50MB chunks
        let totalMB = 0;
        
        console.log('Starting memory stress test...');
        
        const interval = setInterval(() => {
          try {
            chunks.push(Buffer.alloc(allocSize));
            totalMB += 50;
            console.log(\`Allocated: \${totalMB}MB\`);
            
            if (totalMB >= 500) { // Cap at 500MB
              console.log('Reached 500MB cap');
              clearInterval(interval);
            }
          } catch (e) {
            console.log('Memory allocation limit reached');
            clearInterval(interval);
          }
        }, 1000);
        
        // Keep process alive
        process.on('SIGTERM', () => {
          console.log('Stress test stopped');
          process.exit(0);
        });
      `])

      stressProcess.stdout.on('data', (data: Buffer) => {
        console.log(`Stress: ${data.toString()}`)
      })

      stressProcess.on('exit', () => {
        stressProcess = null
      })

      return NextResponse.json({ 
        status: 'started',
        message: 'Memory stress test started - allocating up to 500MB',
        pid: stressProcess.pid
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
      return NextResponse.json({ 
        status: stressProcess ? 'running' : 'stopped',
        pid: stressProcess?.pid || null
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
  return NextResponse.json({ 
    status: stressProcess ? 'running' : 'stopped',
    pid: stressProcess?.pid || null
  })
}
