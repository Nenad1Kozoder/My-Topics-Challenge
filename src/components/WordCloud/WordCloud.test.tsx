import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import WordCloud from "./WordCloud";
import type { Topic } from "../../utils/types";

const mockTopics: Topic[] = [
  {
    label: "React",
    volume: 100,
    sentimentScore: 75,
    sentiment: { positive: 60, neutral: 30, negative: 10 },
  },
];

describe("WordCloud", () => {
  it("renders word with correct color", () => {
    const { container } = render(
      <WordCloud topics={mockTopics} onSelect={vi.fn()} />
    );
    const text = container.querySelector("text");
    expect(text).toHaveAttribute("fill", "green");
  });
});
