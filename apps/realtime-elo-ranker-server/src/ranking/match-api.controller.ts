import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('match')
export class MatchApiController {
  constructor(private readonly rankingService: RankingService) {}

  @Post()
  async recordMatch(
    @Body() body: { winner?: string; loser?: string; draw?: boolean },
  ) {
    const winner = body?.winner?.trim();
    const loser = body?.loser?.trim();
    const isDraw = body?.draw === true;

    if (!winner || !loser) {
      throw new BadRequestException('Le gagnant et le perdant sont requis');
    }

    try {
      const result = await this.rankingService.recordMatchByPlayerName({
        winner,
        loser,
        isDraw,
      });

      return {
        winner: {
          id: result.winner.name,
          rank: result.winner.elo,
        },
        loser: {
          id: result.loser.name,
          rank: result.loser.elo,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(
          "Soit le gagnant, soit le perdant indiqu\u00e9 n'existe pas",
        );
      }
      throw error;
    }
  }
}
