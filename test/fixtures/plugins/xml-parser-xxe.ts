declare function parseXml(xml: string, options: unknown): unknown

export const a = parseXml("<a/>", { noent: true }) // ловит
export const b = parseXml("<a/>", { noent: false })
export const c = parseXml("<a/>", {})
