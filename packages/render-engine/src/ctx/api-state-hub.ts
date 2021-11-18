import { BehaviorSubject, Subject } from 'rxjs';
import { map, skip, filter } from 'rxjs/operators';
import type { Adapter, RequestParams } from '@ofa/api-spec-adapter';

import type { APIStates, APIState, APIStatesSpec, CTX, RunParam } from '../types';
import getResponseState$ from './http/response';

type StreamActions = {
  run: (runParam?: RunParam) => void;
  refresh: () => void;
  // __complete: () => void;
};

function executeCallback(ctx: CTX, state: APIState, runParams?: RunParam): void {
  if (state.loading) {
    return;
  }

  if (state.error) {
    runParams?.onError?.call(ctx, { ...state });
    return;
  }

  runParams?.onSuccess?.call(ctx, { ...state });
}

export default class APIStateHub implements APIStates {
  adapter: Adapter;
  apiStateSpec: APIStatesSpec;
  statesCache: Record<string, [BehaviorSubject<APIState>, StreamActions]> = {};
  ctx: CTX | null = null;

  constructor(adapter: Adapter, apiStateSpec: APIStatesSpec) {
    this.apiStateSpec = apiStateSpec;
    this.adapter = adapter;
  }

  initContext(ctx: CTX): void {
    this.ctx = ctx;
  }

  getState(stateID: string): BehaviorSubject<APIState> {
    const [state$] = this.getStream(stateID);

    // TODO: test error when run convertor
    return state$;
  }

  runAction(stateID: string, runParam?: RunParam): void {
    const action = this.getAction(stateID);
    if (action) {
      action(runParam);
    }
  }

  getAction(stateID: string): (runParam?: RunParam) => void {
    const [, { run }] = this.getStream(stateID);
    return run;
  }

  getStream(stateID: string): [BehaviorSubject<APIState>, StreamActions] {
    if (!this.apiStateSpec[stateID]) {
      // TODO: log error message
    }

    const key = `${stateID}:${this.apiStateSpec[stateID]}`;
    if (!this.statesCache[key]) {
      this.statesCache[key] = this.initState(stateID);
    }

    return this.statesCache[key];
  }

  refresh(stateID: string): void {
    const [, { refresh }] = this.getStream(stateID);
    refresh();
  }

  initState(stateID: string): [BehaviorSubject<APIState>, StreamActions] {
    const operation = this.apiStateSpec[stateID];
    if (!operation) {
      throw new Error(`no operation for stateID: ${stateID}`);
    }
    const params$ = new Subject<RequestParams | undefined>();
    const request$ = params$.pipe(
      // it is adapter's responsibility to handle build error
      // if a error occurred, build should return undefined
      map((params) => this.adapter.build(operation.apiID, params)),
      filter(Boolean),
    );

    const apiState$ = getResponseState$(request$);

    let _latestRunParams: RunParam | undefined = undefined;

    // run callbacks after value resolved
    apiState$.pipe(skip(1)).subscribe((state) => {
      setTimeout(() => {
        // todo refactor this
        executeCallback(
          this.ctx as CTX,
          state,
          _latestRunParams,
        );
      }, 10);
    });

    const streamActions: StreamActions = {
      run: (runParam?: RunParam) => {
        _latestRunParams = runParam;
        params$.next(runParam?.params);
      },
      refresh: () => {
        // override onSuccess and onError to undefined
        _latestRunParams = { params: _latestRunParams?.params };
        params$.next(_latestRunParams?.params);
      },
    };

    return [apiState$, streamActions];
  }
}
