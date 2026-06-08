import { Link } from 'react-router-dom';
import styles from '../styles/components/PrivacyLink.module.css';

export default function PrivacyLink() {
  return (
    <div className={styles.container}>
      <Link to="/privacy" className={styles.link}>
        隐私政策
      </Link>
    </div>
  );
}
