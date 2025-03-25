import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FileSystemService {
  async ensureDirectoryExists(directoryPath: string): Promise<void> {
    try {
      await fs.access(directoryPath);
    } catch {
      await fs.mkdir(directoryPath, { recursive: true });
    }
  }

  async writeFile(filePath: string, data: Buffer): Promise<void> {
    await fs.writeFile(filePath, data);
  }

  async readFile(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath);
  }

  buildPath(...paths: string[]): string {
    return join(...paths);
  }
}
