import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LLMService } from './llm/llm.service';
import { GenApiService } from './gen_api/gen_api.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private llmService: LLMService,
    private genApiService: GenApiService,
  ) {}

  @Get()
  ping(): string {
    return this.appService.getHello();
  }

  @Get('ping/llm')
  pingLLM(): Promise<any> {
    return this.llmService.pingLLM();
  }

  @Get('ping/gen-api')
  pingGenApi(): Promise<any> {
    return this.genApiService.pingGenApi();
  }
}
