import { YDurableObjects as RawYDurableObjects } from "y-durableobjects";

export class YDurableObjects extends RawYDurableObjects<{
  Bindings: Env;
}> {}
