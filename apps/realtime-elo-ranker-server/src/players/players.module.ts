import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { PlayerApiController } from './player-api.controller';
import { EventsModule } from '../events/events.module';
import { RankingCacheModule } from '../ranking/cache/ranking-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player]),
    EventsModule,
    RankingCacheModule,
  ],
  controllers: [PlayersController, PlayerApiController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
