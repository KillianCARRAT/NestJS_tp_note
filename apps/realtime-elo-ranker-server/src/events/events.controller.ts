import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';
import * as eventsService from './events.service';

@Controller('events')
export class EventsController {
  private eventsSubject = new Subject<MessageEvent>();

  @Sse('stream')
  streamEvents(): Observable<MessageEvent> {
    return this.eventsSubject.asObservable();
  }

  @OnEvent(eventsService.RankingEvent.MATCH_RECORDED)
  handleMatchRecorded(event: eventsService.MatchRecordedEvent) {
    this.eventsSubject.next({
      type: 'match-recorded',
      data: event,
    } as MessageEvent);
  }

  @OnEvent(eventsService.RankingEvent.PLAYER_CREATED)
  handlePlayerCreated(event: eventsService.PlayerCreatedEvent) {
    this.eventsSubject.next({
      type: 'player-created',
      data: event,
    } as MessageEvent);
  }

  @OnEvent(eventsService.RankingEvent.PLAYER_UPDATED)
  handlePlayerUpdated(event: eventsService.PlayerUpdatedEvent) {
    this.eventsSubject.next({
      type: 'player-updated',
      data: event,
    } as MessageEvent);
  }

  @OnEvent(eventsService.RankingEvent.PLAYER_DELETED)
  handlePlayerDeleted(event: eventsService.PlayerDeletedEvent) {
    this.eventsSubject.next({
      type: 'player-deleted',
      data: event,
    } as MessageEvent);
  }

  @OnEvent(eventsService.RankingEvent.RANKING_UPDATED)
  handleRankingUpdated(event: eventsService.RankingUpdatedEvent) {
    this.eventsSubject.next({
      type: 'ranking-updated',
      data: event,
    } as MessageEvent);
  }
}
