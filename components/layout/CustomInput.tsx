import React from 'react';
import styles from '../../styles/layout/CustomInput.module.css';

function CustomInput() {
    return (
        <div className={styles.inputContainer}>
            <label htmlFor="email" className={styles.inputLabel}>
                Email
            </label>
            <input
                type="email"
                id="email"
                className={styles.inputField}
                placeholder="Enter your email"
                required
            />
        </div>
    );
}

export default CustomInput;
