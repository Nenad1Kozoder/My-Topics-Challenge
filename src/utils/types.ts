export interface Topic {
  id?: string | number;
  label: string;
  volume: number;
  sentimentScore: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface WordCloudProps {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
}
