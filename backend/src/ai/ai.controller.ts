import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  @ApiOperation({
    summary: 'Ask AI assistant a question about your events',
    description: 'Read-only AI assistant. Cannot create, edit, or delete data.',
  })
  @ApiResponse({
    status: 201,
    description: 'AI response',
    schema: {
      type: 'object',
      properties: {
        answer: {
          type: 'string',
          example: 'You have 3 upcoming events this week.',
        },
      },
    },
  })
  async ask(
    @Body() dto: AskAiDto,
    @CurrentUser() user: { id: string },
  ): Promise<{ answer: string }> {
    const answer = await this.aiService.ask(dto.question, user.id);
    return { answer };
  }
}
