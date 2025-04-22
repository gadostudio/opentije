export type Result<T> =
  | {
      type: "success";
      data: T;
    }
  | {
      type: "error";
      error: unknown;
      data?: T;
    }
  | {
      type: "loading";
      data?: T;
    };
