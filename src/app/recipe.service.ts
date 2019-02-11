import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { WebsocketService } from './websocket.service';

const RECIPE_URL = 'ws://127.0.0.1:8765/';

export interface Recipe {
  data: string
}

@Injectable()
export class RecipeService {
  public recipes: Subject<Recipe>;

  constructor(wsService: WebsocketService) {
    this.recipes = <Subject<Recipe>>wsService
            .connect(RECIPE_URL)
            .map((response:MessageEvent): Recipe => {
              let data = response.data
              return {
                data: data
              }
            });
  }
}
