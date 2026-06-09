// KeywordTags - v4.0 胶囊式关键词标签，深色主题
import styles from '../styles/components/KeywordTags.module.css';

interface KeywordTagsProps {
  keywords: string[];
  color?: string;
}

export default function KeywordTags({ keywords, color }: KeywordTagsProps) {
  return (
    <div className={styles.container}>
      {keywords.map((kw, i) => (
        <span
          key={i}
          className={styles.tag}
          style={color ? { color } : undefined}
        >
          # {kw}
        </span>
      ))}
    </div>
  );
}
