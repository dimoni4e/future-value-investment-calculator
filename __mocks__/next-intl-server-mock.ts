export const getTranslations = async () => ({
  t: (key: string, params?: Record<string, any>) =>
    `${key}${params ? `:${JSON.stringify(params)}` : ''}`,
  richText: (key: string) => key,
})

export const getMessages = async () => ({})
export const getLocale = () => 'en'
export const setRequestLocale = () => {}
export const getTimeZone = () => 'UTC'
export const getNow = () => new Date()
export const getFormatter = () => ({ number: (n: number) => String(n) })
export const getRequestConfig = () => ({ messages: {} })
