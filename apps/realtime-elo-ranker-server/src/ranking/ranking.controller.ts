import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { RankingService } from './ranking.service';
import { MatchResultDto } from './dto/match-result.dto';
import { Player } from '../players/player.entity';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  /**
   * Enregistrer un nouveau match
   * POST /ranking/match
   */
  @Post('match')
  async recordMatch(@Body() matchResult: MatchResultDto) {
    return await this.rankingService.recordMatch(matchResult);
  }

  /**
   * Récupérer le classement complet
   * GET /ranking
   */
  @Get()
  async getRanking(): Promise<Array<{ id: string; rank: number }>> {
    const ranking = await this.rankingService.getRanking();

    if (ranking.length === 0) {
      throw new NotFoundException(
        "Le classement n'est pas disponible car aucun joueur n'existe",
      );
    }

    return ranking.map((player) => ({
      id: player.name,
      rank: player.elo,
    }));
  }

  /**
   * Récupérer le classement avec les positions
   * GET /ranking/with-positions
   */
  @Get('with-positions')
  async getRankingWithPositions() {
    return await this.rankingService.getRankingWithPositions();
  }

  /**
   * Récupérer le top N joueurs
   * GET /ranking/top?limit=10
   */
  @Get('top')
  async getTopPlayers(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<Player[]> {
    return await this.rankingService.getTopPlayers(limit);
  }

  /**
   * Récupérer la position d'un joueur
   * GET /ranking/player/:id/rank
   */
  @Get('player/:id/rank')
  async getPlayerRank(
    @Param('id') playerId: string,
  ): Promise<{ rank: number }> {
    const rank = await this.rankingService.getPlayerRank(playerId);
    return { rank };
  }

  /**
   * Estimer l'issue d'un match entre deux joueurs
   * GET /ranking/estimate?player1=xxx&player2=yyy
   */
  @Get('estimate')
  async estimateMatch(
    @Query('player1') player1Id: string,
    @Query('player2') player2Id: string,
  ) {
    return await this.rankingService.estimateMatchOutcome(player1Id, player2Id);
  }

  /**
   * Réinitialiser l'ELO d'un joueur
   * POST /ranking/player/:id/reset
   */
  @Post('player/:id/reset')
  async resetPlayerElo(
    @Param('id') playerId: string,
    @Body() body: { newElo?: number },
  ): Promise<Player> {
    return await this.rankingService.resetPlayerElo(playerId, body.newElo);
  }
}
