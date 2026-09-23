import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins and drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("lets the last conflicting Tailwind class win", () => {
    expect(cn("bg-brand border-ink", "bg-transparent border-white")).toBe(
      "bg-transparent border-white",
    );
  });
});
