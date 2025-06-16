import { afterAll, describe, expect, it } from "vitest";
import { build } from "../helper.js";

describe("Example route", () => {
  it("should return example message", async () => {
    const app = await build({ after: afterAll });

    const res = await app.inject({
      url: "/example",
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe("this is an example");
  });
});
