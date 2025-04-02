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

  async renameDirectory(oldPath: string, newPath: string): Promise<void> {
    try {
      await fs.rename(oldPath, newPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Source directory ${oldPath} does not exist`);
      }
      if (error.code === 'EEXIST') {
        throw new Error(`Destination directory ${newPath} already exists`);
      }
      throw error;
    }
  }
}
