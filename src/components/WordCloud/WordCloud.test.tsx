import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import WordCloud from "./WordCloud";
import { sentimentColor } from "../../utils/scale";
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
  it("renders word with correct color based on sentimentScore", () => {
    const { container } = render(
      <WordCloud topics={mockTopics} onSelect={vi.fn()} />
    );
    const text = container.querySelector("text");
    expect(text).toBeTruthy();
    expect(text).toHaveAttribute(
      "fill",
      sentimentColor(mockTopics[0].sentimentScore)
    );
  });

  it("calls onSelect when word is clicked", () => {
    const onSelectMock = vi.fn();
    const { getByText } = render(
      <WordCloud topics={mockTopics} onSelect={onSelectMock} />
    );
    const word = getByText(mockTopics[0].label);
    fireEvent.click(word);
    expect(onSelectMock).toHaveBeenCalledWith(mockTopics[0]);
  });
});
