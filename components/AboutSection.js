import styles from '../styles/About.module.css'

export default function AboutSection({ section }) {
  return (
    <section className={styles.sectionCard}>
      <h2>{section.title}</h2>
      {section.content?.map((paragraph, index) => (
        <p key={`${section.title}-paragraph-${index}`}>{paragraph}</p>
      ))}
      {section.bullets?.length > 0 && (
        <ul>
          {section.bullets.map((item, index) => (
            <li key={`${section.title}-bullet-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
