export const getDateString = (date: Date) => {
    const day = date.getDate()
    const dayString = (day < 10 ? `0` + day : day).toString()
    const month = date.getMonth()+1
    const monthString = (month < 10 ? `0` + month : month).toString()
    const minutes = date.getMinutes()
    const minutesString = (minutes < 10 ? `0` + minutes : minutes).toString()
    return `${dayString}.${monthString}.${date.getFullYear()} ${date.getHours()}:${minutesString}`
}

export const getUTCDateString = (date: Date) => {
    const utcDay = date.getUTCDate()
    const utcDayString = (utcDay < 10 ? `0` + utcDay : utcDay).toString()
    const utcMonth = date.getUTCMonth()+1
    const utcMonthString = (utcMonth < 10 ? `0` + utcMonth : utcMonth).toString()
    const utcMinutes = date.getUTCMinutes()
    const utcMinutesString = (utcMinutes < 10 ? `0` + utcMinutes : utcMinutes).toString()
    return`${utcDayString}.${utcMonthString}.${date.getUTCFullYear()} ${date.getUTCHours()}:${utcMinutesString}`
}

