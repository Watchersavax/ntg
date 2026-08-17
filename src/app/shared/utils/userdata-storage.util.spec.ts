import { readUserData } from "./userdata-storage.util";

describe("userdata-storage.util", () => {
  afterEach(() => {
    localStorage.removeItem("userdata");
  });

  it("returns empty object when userdata is missing", () => {
    expect(readUserData()).toEqual({});
  });

  it("returns empty object when userdata is malformed", () => {
    localStorage.setItem("userdata", "{bad json");

    expect(readUserData()).toEqual({});
  });

  it("returns parsed userdata", () => {
    localStorage.setItem("userdata", JSON.stringify({ userId: 25, isAgent: true }));

    expect(readUserData().userId).toBe(25);
    expect(readUserData().isAgent).toBe(true);
  });
});
