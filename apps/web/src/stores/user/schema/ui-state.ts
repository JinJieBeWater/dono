import { Schema, SessionIdSymbol, State } from "@livestore/livestore";

export const uiState = State.SQLite.clientDocument({
  name: "UiState",
  schema: Schema.Struct({
    lastAccessedNovelId: Schema.String,
  }),
  default: { id: SessionIdSymbol, value: { lastAccessedNovelId: "" } },
});

export type UiState = typeof uiState.Type;
