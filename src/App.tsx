import { useEffect, useState } from "react";
import WordCloud from "./components/WordCloud/WordCloud";
import type { Topic } from "./utils/types";
import styles from "./App.module.css";

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/topics.json")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data.topics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loader}>
        <p>Loading topics...</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <h1 className={styles.app__title}>My Topics Challenge</h1>

      <WordCloud topics={topics} onSelect={setSelected} />

      <div className={styles.app__info}>
        <h2 className={styles.app__infoTitle}>
          Information on topic:{" "}
          <span className={styles.app__topicWord}>
            {`"${selected ? selected.label : "Please Select Topic"}"`}
          </span>
        </h2>

        <h3 className={styles.app__mentionsTitle}>Mentions:</h3>
        <ul className={styles.app__mentionsList}>
          <li>
            Positive:{" "}
            <span className={styles["app__mentionsValue--positive"]}>
              {selected?.sentiment.positive ?? 0}
            </span>
          </li>
          <li>
            Neutral:{" "}
            <span className={styles["app__mentionsValue--neutral"]}>
              {selected?.sentiment.neutral ?? 0}
            </span>
          </li>
          <li>
            Negative:{" "}
            <span className={styles["app__mentionsValue--negative"]}>
              {selected?.sentiment.negative ?? 0}
            </span>
          </li>
        </ul>

        <p className={styles.app__total}>
          Total:{" "}
          <span className={styles.app__totalValue}>
            {selected?.volume ?? 0}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;
