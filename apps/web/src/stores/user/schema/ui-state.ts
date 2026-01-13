import { Schema, SessionIdSymbol, State } from "@livestore/livestore";

export const uiState = State.SQLite.clientDocument({
  name: "UiState",
  schema: Schema.Struct({
    lastAccessedNovelId: Schema.String,
    lastNovelPurgeGlobalSeq: Schema.Number,
  }),
  default: {
    id: SessionIdSymbol,
    value: {
      lastAccessedNovelId: "",
      lastNovelPurgeGlobalSeq: 0,
    },
  },
});

export type UiState = typeof uiState.Type;
