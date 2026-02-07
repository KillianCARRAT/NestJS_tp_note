import { Module } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { MatchApiController } from './match-api.controller';
import { EloService } from './elo.service';
import { PlayersModule } from '../players/players.module';
import { EventsModule } from '../events/events.module';
import { RankingCacheModule } from './cache/ranking-cache.module';

@Module({
  imports: [PlayersModule, EventsModule, RankingCacheModule],
  controllers: [RankingController, MatchApiController],
  providers: [RankingService, EloService],
  exports: [RankingService, EloService],
})
export class RankingModule {}
