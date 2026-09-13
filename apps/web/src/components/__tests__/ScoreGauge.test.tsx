import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreGauge, getScoreBand } from "../ScoreGauge";

describe("getScoreBand", () => {
  it("returns 'low' for scores under 50", () => {
    expect(getScoreBand(0)).toBe("low");
    expect(getScoreBand(49)).toBe("low");
  });

  it("returns 'medium' for scores from 50 to 74", () => {
    expect(getScoreBand(50)).toBe("medium");
    expect(getScoreBand(74)).toBe("medium");
  });

  it("returns 'high' for scores of 75 and above", () => {
    expect(getScoreBand(75)).toBe("high");
    expect(getScoreBand(100)).toBe("high");
  });
});

describe("ScoreGauge", () => {
  it("renders the red/low band under 50", () => {
    render(<ScoreGauge score={30} />);
    expect(screen.getByTestId("score-gauge")).toHaveAttribute("data-band", "low");
  });

  it("renders the amber/medium band between 50 and 74", () => {
    render(<ScoreGauge score={60} />);
    expect(screen.getByTestId("score-gauge")).toHaveAttribute("data-band", "medium");
  });

  it("renders the green/high band at 75 and above", () => {
    render(<ScoreGauge score={90} />);
    expect(screen.getByTestId("score-gauge")).toHaveAttribute("data-band", "high");
  });
});
