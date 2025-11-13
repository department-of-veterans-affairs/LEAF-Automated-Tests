import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  // ✅ FIXED: Reduced retries to identify real issues faster
  retries: process.env.CI ? 2 : 1,
  
  // ✅ FIXED: Limit workers to prevent resource contention
  workers: process.env.CI ? 1 : 6, // Max 6 workers locally
  
  // ✅ FIXED: Increase global timeout for slower Docker environment
  timeout: 60000, // 60 seconds per test
  
  // ✅ FIXED: Expect timeout for assertions
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  
  reporter: [
    ['list'], 
    ['html', { open: 'never' }],
    // ✅ ADD: JSON reporter for CI analysis
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  use: {
    // ✅ FIXED: Comprehensive timeout settings
    actionTimeout: 15000,        // 15s for actions (clicking, filling, etc.)
    navigationTimeout: 30000,    // 30s for page navigation
    
    // ✅ FIXED: Always capture traces on failure for debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    ignoreHTTPSErrors: true,
    
    // ✅ FIXED: Ensure fresh context for each test
    contextOptions: {
      ignoreHTTPSErrors: true,
      // Clear all storage between tests
      storageState: undefined,
    }
  },
  
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1800, height: 900 },
        
        // ✅ FIXED: Docker-optimized browser settings
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',                    // Critical for Docker
            '--disable-background-timer-throttling',      // Prevent throttling
            '--disable-backgrounding-occluded-windows',   // Keep windows active
            '--disable-renderer-backgrounding',           // Prevent background throttling
            '--disable-features=TranslateUI',            // Disable translate popup
            '--disable-ipc-flooding-protection',         // Prevent IPC issues
            '--disable-background-networking',           // Reduce background activity
            '--disable-sync',                            // Disable Chrome sync
            '--metrics-recording-only',                  // Reduce overhead
            '--no-first-run',                           // Skip first run setup
          ],
          // ✅ FIXED: Increase timeouts for slower Docker environment
          timeout: 60000,
        }
      },
    }
  ],
});