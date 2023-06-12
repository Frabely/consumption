import styles from '../../styles/layout/Header.module.css'

export default function Header({}: HeaderProps) {

    return (
        <div className={styles.mainContainer}>
            <div>Logo</div>
            <menu className={styles.menu}>
                <div className={styles.menuItem}>link1</div>
                <div className={styles.menuItem}>link2</div>
                <div className={styles.menuItem}>link3</div>
            </menu>
        </div>
    )
}

export type HeaderProps = {}
