import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersModule } from './players/players.module';
import { RankingModule } from './ranking/ranking.module';
import { RouterModule } from '@nestjs/core';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      autoSave: true,
      location: 'realtime-elo-ranker.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),

    EventsModule,
    PlayersModule,
    RankingModule,

    RouterModule.register([
      {
        path: 'api',
        children: [PlayersModule, RankingModule],
      },
    ]),
  ],
})
export class AppModule {}
