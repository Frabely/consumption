export const getDateString = (date: Date) => {
    const dayString = (date.getDay() < 10 ? `0` + date.getDay() : date.getDay()).toString()
    const monthString = (date.getMonth() < 10 ? `0` + date.getMonth() : date.getMonth()).toString()
    return `${dayString}.${monthString}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
}

export const getUTCDateString = (date: Date) => {
    const utcDayString = (date.getUTCDay() < 10 ? `0` + date.getUTCDay() : date.getUTCDay()).toString()
    const utcMonthString = (date.getUTCMonth() < 10 ? `0` + date.getUTCMonth() : date.getUTCMonth()).toString()
    return`${utcDayString}.${utcMonthString}.${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}`
}

