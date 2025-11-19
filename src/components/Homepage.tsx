'use client';
import styles from './homepage.module.css';
import { useAppSelector } from '../lib/hooks';

export default function Homepage() {
  const { user } = useAppSelector((state) => state.user);
  const { homeSections } = useAppSelector((state) => state.homeSections);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lovacado web store</h1>
      {homeSections.map((section) => {
        return (
          <div key={section._id} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <img
              className={styles.sectionImage}
              src={`${process.env.NEXT_PUBLIC_IMAGES}${section.image}`}
              alt={section.title}
              width={500}
            />
            {section.paragraphs && section.paragraphs.map((paragraph, index) => {
              return <p key={index} className={styles.sectionParagraph}>{paragraph}</p>
            })}
          </div>
        );
      })}
    </div>
  );
}
