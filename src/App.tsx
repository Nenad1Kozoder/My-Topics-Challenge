import { useEffect, useState } from "react";
import WordCloud from "./components/WordCloud/WordCloud";
import type { Topic } from "./utils/types";
import styles from "./App.module.css";

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Topic | null>(null);

  useEffect(() => {
    fetch("/topics.json")
      .then((res) => res.json())
      .then((data) => setTopics(data.topics));
  }, []);

  return (
    <div className={styles.wordCloudHolder}>
      <h1 className={styles.title}>My Topics Challenge</h1>
      <WordCloud topics={topics} onSelect={setSelected} />
      <div>
        <h2 className={styles.informationTitle}>
          Information on topic:{" "}
          <span className={styles.topicWord}>{`"${
            selected ? selected.label : "Please Select Topic"
          }"`}</span>
        </h2>
        <h3 className={styles.mentionsTitle}>Mentions:</h3>
        <ul className={styles.list}>
          <li>
            Positive:
            <span className={styles.positive}>
              {selected ? selected.sentiment.positive || 0 : 0}
            </span>
          </li>
          <li>
            Neutral:
            <span className={styles.neutral}>
              {selected ? selected.sentiment.neutral || 0 : 0}
            </span>
          </li>
          <li>
            Negative:
            <span className={styles.negative}>
              {selected ? selected.sentiment.negative || 0 : 0}
            </span>
          </li>
        </ul>
        <p className={styles.total}>
          Total{" "}
          <span className={styles.totalNum}>
            {selected ? selected.volume : 0}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;
