import { Module } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { EloService } from './elo.service';
import { PlayersModule } from '../players/players.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PlayersModule, EventsModule],
  controllers: [RankingController],
  providers: [RankingService, EloService],
  exports: [RankingService, EloService],
})
export class RankingModule {}
