// 翻译性别female/Female-女  male/Male-男
export const formatGenderDesc = (text: string) => {
  if (!text) { return '' }
  if (text.toLowerCase().match(/^[A-Za-z]/g)) {
    // 英文：需要翻译
    return text.toLowerCase() === 'female' ? '女' : '男'
  } else {
    return text;
  }
}