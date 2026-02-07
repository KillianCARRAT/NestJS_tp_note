import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';
import * as eventsService from './events.service';

@Controller('api/ranking')
export class RankingEventsController {
  private readonly eventsSubject = new Subject<MessageEvent>();

  @Sse('events')
  streamRankingEvents(): Observable<MessageEvent> {
    return this.eventsSubject.asObservable();
  }

  @OnEvent(eventsService.RankingEvent.PLAYER_CREATED)
  handlePlayerCreated(event: eventsService.PlayerCreatedEvent) {
    this.emitRankingUpdate(event.player.name, event.player.elo);
  }

  @OnEvent(eventsService.RankingEvent.PLAYER_UPDATED)
  handlePlayerUpdated(event: eventsService.PlayerUpdatedEvent) {
    this.emitRankingUpdate(event.player.name, event.player.elo);
  }

  private emitRankingUpdate(id: string, rank: number) {
    this.eventsSubject.next({
      data: {
        type: 'RankingUpdate',
        player: {
          id,
          rank,
        },
      },
    } as MessageEvent);
  }
}
