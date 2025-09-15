#!/usr/bin/env node
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface TestResult {
  testFile: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
  retryAttempt?: number;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  results: TestResult[];
}

class SequentialPlaywrightRunner {
  private testFolder: string;
  private playwrightCommand: string;
  private testPattern: RegExp;
  private resetUrl: string;

  constructor(testFolder: string, playwrightCommand: string = 'npx playwright test', resetUrl: string = 'http://host.docker.internal:8000/api/v1/test') {
    this.testFolder = testFolder;
    this.playwrightCommand = playwrightCommand;
    this.testPattern = /\.(test|spec)\.(ts|js)$/;
    this.resetUrl = resetUrl;
  }

  async findTestFiles(): Promise<string[]> {
    try {
      const files = await this.readDirRecursive(this.testFolder);
      return files.filter(file => this.testPattern.test(file));
    } catch (error) {
      throw new Error(`Failed to read test folder: ${error}`);
    }
  }

  private async readDirRecursive(dir: string): Promise<string[]> {
    const files: string[] = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        const subFiles = await this.readDirRecursive(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  async resetDatabase(): Promise<void> {
    console.log(`🔄 Resetting database: ${this.resetUrl}`);
    
    try {
      const response = await fetch(this.resetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Database reset completed');
    } catch (error) {
      console.error(`❌ Database reset failed: ${error}`);
      throw new Error(`Failed to reset database: ${error}`);
    }
  }

  async runSingleTest(testFile: string, retryAttempt: number = 0): Promise<TestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let output = '';
      let error = '';
      const retryPrefix = retryAttempt > 0 ? ` (retry ${retryAttempt})` : '';

      console.log(`🧪 Running: ${testFile}${retryPrefix}`);

      const [command, ...args] = this.playwrightCommand.split(' ');
      const child = spawn(command, [...args, testFile], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: process.platform === 'win32'
      });

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        const passed = code === 0;

        console.log(`${passed ? '✅' : '❌'} ${testFile}${retryPrefix} - ${duration}ms`);

        resolve({
          testFile,
          passed,
          duration,
          output: output.trim(),
          error: error.trim() || undefined,
          retryAttempt
        });
      });

      child.on('error', (err) => {
        const duration = Date.now() - startTime;
        console.log(`❌ ${testFile}${retryPrefix} - Error: ${err.message}`);

        resolve({
          testFile,
          passed: false,
          duration,
          output: output.trim(),
          error: `Process error: ${err.message}`,
          retryAttempt
        });
      });
    });
  }

  async runAllTests(): Promise<TestSummary> {
    const startTime = Date.now();
    const testFiles = await this.findTestFiles();

    if (testFiles.length === 0) {
      throw new Error(`No test files found in ${this.testFolder}`);
    }

    console.log(`\n📋 Found ${testFiles.length} test files`);
    
    // Reset database before starting tests
    await this.resetDatabase();
    
    console.log('🚀 Starting sequential test execution...\n');

    const results: TestResult[] = [];

    for (const testFile of testFiles) {
      let result = await this.runSingleTest(testFile, 0);
      
      // If the test failed, reset database and retry once
      if (!result.passed) {
        console.log(`🔄 Test failed, resetting database and retrying...`);
        try {
          await this.resetDatabase();
          result = await this.runSingleTest(testFile, 1);
        } catch (resetError) {
          console.error(`❌ Database reset failed during retry: ${resetError}`);
          // Continue with the original failed result
        }
      }
      
      results.push(result);
    }

    const totalDuration = Date.now() - startTime;
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;

    return {
      totalTests: results.length,
      passed,
      failed,
      duration: totalDuration,
      results
    };
  }

  generateReport(summary: TestSummary): string {
    const { totalTests, passed, failed, duration, results } = summary;

    let report = '\n' + '='.repeat(60) + '\n';
    report += '📊 SEQUENTIAL PLAYWRIGHT TEST REPORT\n';
    report += '='.repeat(60) + '\n\n';

    // Summary
    report += `📈 SUMMARY:\n`;
    report += `   Total Tests: ${totalTests}\n`;
    report += `   ✅ Passed: ${passed}\n`;
    report += `   ❌ Failed: ${failed}\n`;
    report += `   ⏱️  Total Duration: ${this.formatDuration(duration)}\n`;
    report += `   📊 Success Rate: ${totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0}%\n\n`;

    // Failed tests (if any)
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      report += `❌ FAILED TESTS (${failedTests.length}):\n`;
      report += '-'.repeat(40) + '\n';
      failedTests.forEach(test => {
        const retryInfo = test.retryAttempt && test.retryAttempt > 0 ? ` (failed after retry)` : '';
        report += `   • ${test.testFile} (${this.formatDuration(test.duration)})${retryInfo}\n`;
        if (test.error) {
          report += `     Error: ${test.error.split('\n')[0]}\n`;
        }
      });
      report += '\n';
    }

    // Passed tests
    const passedTests = results.filter(r => r.passed);
    if (passedTests.length > 0) {
      report += `✅ PASSED TESTS (${passedTests.length}):\n`;
      report += '-'.repeat(40) + '\n';
      passedTests.forEach(test => {
        const retryInfo = test.retryAttempt && test.retryAttempt > 0 ? ` (passed on retry ${test.retryAttempt})` : '';
        report += `   • ${test.testFile} (${this.formatDuration(test.duration)})${retryInfo}\n`;
      });
      report += '\n';
    }

    // Detailed results (optional - can be enabled for debugging)
    const showDetailedOutput = process.argv.includes('--verbose') || process.argv.includes('-v');
    if (showDetailedOutput && failedTests.length > 0) {
      report += `🔍 DETAILED FAILURE OUTPUT:\n`;
      report += '='.repeat(60) + '\n';
      failedTests.forEach(test => {
        report += `\n📄 ${test.testFile}:\n`;
        report += '-'.repeat(30) + '\n';
        if (test.output) {
          report += test.output + '\n';
        }
        if (test.error) {
          report += `Error: ${test.error}\n`;
        }
        report += '-'.repeat(30) + '\n';
      });
    }

    report += '='.repeat(60) + '\n';

    return report;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  async saveReport(report: string, filename: string = 'playwright-sequential-report.txt'): Promise<void> {
    try {
      await fs.writeFile(filename, report);
      console.log(`📄 Report saved to: ${filename}`);
    } catch (error) {
      console.error(`Failed to save report: ${error}`);
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 Sequential Playwright Test Runner with Database Reset

Usage: node sequential-runner.ts [options] <test-folder>

Arguments:
  <test-folder>     Path to the folder containing test files

Options:
  --command, -c     Playwright command to use (default: "npx playwright test")
  --reset-url, -r   Database reset URL (default: "http://host.docker.internal:8000/api/v1/test")
  --output, -o      Output file for the report (default: playwright-sequential-report.txt)
  --verbose, -v     Include detailed output in the report
  --help, -h        Show this help message

Features:
  • Resets database before running tests
  • Runs tests sequentially to avoid conflicts
  • Automatically retries failed tests after database reset
  • Generates comprehensive reports with retry information

Examples:
  node sequential-runner.ts tests/
  node sequential-runner.ts tests/ --verbose
  node sequential-runner.ts tests/ --command "npx playwright test --headed"
  node sequential-runner.ts tests/ --reset-url "http://localhost:8000/api/reset"
  node sequential-runner.ts tests/ --output my-report.txt
    `);
    process.exit(0);
  }

  const testFolder = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-')) || './tests';
  const commandIndex = args.findIndex(arg => arg === '--command' || arg === '-c');
  const outputIndex = args.findIndex(arg => arg === '--output' || arg === '-o');
  const resetUrlIndex = args.findIndex(arg => arg === '--reset-url' || arg === '-r');
  
  const playwrightCommand = commandIndex !== -1 ? args[commandIndex + 1] : 'npx playwright test';
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'playwright-sequential-report.txt';
  const resetUrl = resetUrlIndex !== -1 ? args[resetUrlIndex + 1] : 'http://host.docker.internal:8000/api/v1/test';

  try {
    const runner = new SequentialPlaywrightRunner(testFolder, playwrightCommand, resetUrl);
    const summary = await runner.runAllTests();
    const report = runner.generateReport(summary);
    
    console.log(report);
    await runner.saveReport(report, outputFile);

    // Exit with appropriate code
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SequentialPlaywrightRunner };