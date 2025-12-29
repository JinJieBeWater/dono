import { Schema, SessionIdSymbol, State } from "@livestore/livestore";

export const uiState = State.SQLite.clientDocument({
  name: "UiState",
  schema: Schema.Struct({
    novelFilter: Schema.Literal("active", "trashed", "archived"),
  }),
  default: { id: SessionIdSymbol, value: { novelFilter: "active" } },
});
