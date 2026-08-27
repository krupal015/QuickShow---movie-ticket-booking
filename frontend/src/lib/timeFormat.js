 const timeFormat = (minute) => {
    const hour = Math.floor(minute/60)
    const minutesREminder  = minute % 60

    return `${hour}h ${minutesREminder}m `
 }

 export default timeFormat