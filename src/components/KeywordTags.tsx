// KeywordTags - 展示3个#关键词标签，横向排列，圆角标签样式
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
          style={color ? {
            background: `${color}18`,
            color: color,
            borderColor: `${color}40`,
          } : undefined}
        >
          # {kw}
        </span>
      ))}
    </div>
  );
}
